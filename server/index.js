const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const prisma = require('./prisma');

require('dotenv').config();

const { verifyToken, checkRole } = require('./middleware/auth');
const { validateCreateUser, validateCreateBooking, validatePayment, validateTransfer, validateLogin } = require('./middleware/validation');
const { logger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Fail-fast: crash at startup if critical env vars are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server will not start.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// ============ HELPERS ============
const sendStandardResponse = (res, data = null, status = 200, error = null) => {
  res.status(status).json({
    success: !error,
    data,
    error: error ? (typeof error === 'string' ? error : error.message) : null
  });
};

const recordActivity = async (action, details, severity = 'info', req = null) => {
  try {
    const user_name = req?.user?.name || 'System';
    const user_id = req?.user?.id || null;
    await prisma.auditLog.create({
      data: { action, details, severity, user_name, user_id }
    });
  } catch (err) {
    console.error(`Audit Log Fail: ${err.message}`);
  }
};

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? FRONTEND_URL.split(',').map(u => u.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(logger);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// ============ DASHBOARD METRICS ============
app.get('/api/dashboard/metrics', verifyToken, async (req, res, _next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalPlots,
      soldPlots,
      totalTokens,
      totalCustomers,
      txTotals,
      dailyTxTotals,
      pendingTransfers,
      totalVisitors,
      systemUsers,
      installments
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: { in: ['booked', 'sold'] } } }),
      prisma.token.count(),
      prisma.customer.count(),
      prisma.transaction.aggregate({
        _sum: { credit: true, debit: true }
      }),
      prisma.transaction.aggregate({
        where: { date: today },
        _sum: { credit: true, debit: true }
      }),
      prisma.transferRequest.count({ where: { status: 'Pending' } }),
      prisma.visitor.count(),
      prisma.user.count(),
      prisma.installment.findMany() // Fetch to compute receivable & overdue
    ]);

    const receivableAmt = installments
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount)), 0);

    const overdueAmt = installments
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount)), 0);

    const results = {
      totalPlots,
      soldPlots,
      totalTokens,
      totalCustomers,
      balance: (txTotals._sum.credit || 0) - (txTotals._sum.debit || 0),
      totalIncome: txTotals._sum.credit || 0,
      totalExpense: txTotals._sum.debit || 0,
      dailyIncome: dailyTxTotals._sum.credit || 0,
      dailyExpense: dailyTxTotals._sum.debit || 0
    };

    // Calculate Monthly Growth (MoM)
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.toISOString().substring(0, 7);

    const [thisMonthRevenue, lastMonthRevenue, thisMonthBookings, lastMonthBookings, thisMonthCustomers, lastMonthCustomers] = await Promise.all([
      prisma.transaction.aggregate({ where: { date: { startsWith: currentMonth }, credit: { gt: 0 } }, _sum: { credit: true } }),
      prisma.transaction.aggregate({ where: { date: { startsWith: lastMonth }, credit: { gt: 0 } }, _sum: { credit: true } }),
      prisma.booking.count({ where: { date: { startsWith: currentMonth } } }),
      prisma.booking.count({ where: { date: { startsWith: lastMonth } } }),
      prisma.customer.count({ where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
      prisma.customer.count({ where: { createdAt: { gte: lastMonthDate, lt: new Date(now.getFullYear(), now.getMonth(), 1) } } })
    ]);

    const calcGrowth = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? "+100%" : "0%";
      const g = ((curr - prev) / prev) * 100;
      return (g >= 0 ? "+" : "") + g.toFixed(1) + "%";
    };

    sendStandardResponse(res, {
      availableBalance: `Rs. ${results.balance.toLocaleString()}`,
      totalReceived: `Rs. ${results.totalIncome.toLocaleString()}`,
      receivable: `Rs. ${receivableAmt.toLocaleString()}`,
      totalShortAmount: `Rs. ${overdueAmt.toLocaleString()}`,
      dailyExpenses: `Rs. ${results.dailyExpense.toLocaleString()}`,
      dailyReceipted: `Rs. ${results.dailyIncome.toLocaleString()}`,
      totalShops: `${results.totalPlots}`,
      soldShop: results.soldPlots,
      unsoldShops: results.totalPlots - results.soldPlots,
      transferApproval: `${pendingTransfers}`,
      customers: results.totalCustomers,
      totalVisitors: `${totalVisitors}`,
      systemUsers: `${systemUsers}`,
      totalTownSales: `Rs. ${results.totalIncome.toLocaleString()}`,
      totalExpense: `Rs. ${results.totalExpense.toLocaleString()}`,
      tokenAmount: `Rs. ${results.totalTokens * 50000}`,
      revenueGrowth: calcGrowth(Number(thisMonthRevenue._sum.credit || 0), Number(lastMonthRevenue._sum.credit || 0)),
      bookingsGrowth: calcGrowth(thisMonthBookings, lastMonthBookings),
      propertiesGrowth: calcGrowth(results.soldPlots, 0), // Cumulative
      customersGrowth: calcGrowth(thisMonthCustomers, lastMonthCustomers)
    });
  } catch (err) {
    _next(err);
  }
});

app.get('/api/dashboard/notifications', verifyToken, async (req, res, _next) => {
  try {
    const [bookings, transactions] = await Promise.all([
      prisma.booking.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        select: { date: true, booking_no: true }
      }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        select: { date: true, description: true }
      })
    ]);

    const mappedBookings = bookings.map(b => ({
      type: 'booking',
      date: b.date,
      message: `New Booking: ${b.booking_no}`
    }));

    const mappedTransactions = transactions.map(t => ({
      type: 'transaction',
      date: t.date,
      message: t.description
    }));

    let results = [...mappedBookings, ...mappedTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    sendStandardResponse(res, results);
  } catch (err) {
    _next(err);
  }
});

// ============ DASHBOARD CHART ROUTES (Robust Dummy Data Fallbacks) ============
app.get('/api/dashboard/charts/revenue-trend', verifyToken, async (req, res, _next) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = await prisma.transaction.groupBy({
      by: ['date'],
      where: { 
        date: { contains: currentYear.toString() },
        credit: { gt: 0 }
      },
      _sum: { credit: true }
    });

    const data = months.map((month, index) => {
      const monthStr = (index + 1).toString().padStart(2, '0');
      const monthTotal = monthlyIncome
        .filter(t => t.date.includes(`-${monthStr}-`))
        .reduce((sum, t) => sum + (t._sum.credit || 0), 0);
      
      return { name: month, april: monthTotal }; // naming 'april' to match frontend key for now
    });

    sendStandardResponse(res, data);
  } catch (err) {
    _next(err);
  }
});

// ============ AUTHENTICATION (JWT) ============
app.post('/api/auth/login', authLimiter, validateLogin, async (req, res) => {
  const { email, password } = req.validated;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return sendStandardResponse(res, null, 401, 'Invalid credentials.');

    const storedPassword = user.password || '';
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);
    let passwordValid = false;

    if (isBcryptHash) {
      passwordValid = bcrypt.compareSync(password, storedPassword);
    } else {
      passwordValid = password === storedPassword;
      // Auto-upgrade legacy plaintext passwords
      if (passwordValid) {
        const upgradedHash = bcrypt.hashSync(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: upgradedHash },
        });
      }
    }

    if (!passwordValid) return sendStandardResponse(res, null, 401, 'Invalid credentials.');

    // Fetch user's role permissions
    const userRole = await prisma.role.findFirst({ where: { name: user.role } });
    const permissions = userRole?.permissions ? JSON.parse(userRole.permissions) : null;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    sendStandardResponse(res, { 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        email: user.email, 
        mobile_no: user.mobile_no,
        permissions 
      } 
    });
  } catch (err) {
    sendStandardResponse(res, null, 500, err);
  }
});

app.get('/api/dashboard/charts/sales-mix', verifyToken, async (req, res, _next) => {
  try {
    const counts = await prisma.property.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
    
    const rows = counts.map(c => ({
      name: c.status,
      value: c._count._all
    }));

    sendStandardResponse(res, rows);
  } catch (err) {
    _next(err);
  }
});

app.get('/api/dashboard/charts/receivable-vs-collected', verifyToken, async (req, res, _next) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyInstallments = await prisma.installment.findMany({
      where: { 
        due_date: { contains: currentYear.toString() }
      }
    });

    const data = months.map((month, index) => {
      const monthStr = (index + 1).toString().padStart(2, '0');
      const filtered = monthlyInstallments.filter(i => i.due_date.includes(`-${monthStr}-`));
      
      const receivable = filtered.reduce((sum, i) => sum + (i.amount || 0), 0);
      const collected = filtered.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
      
      return { name: month, receivable, collected };
    });

    sendStandardResponse(res, data);
  } catch (err) {
    _next(err);
  }
});

app.get('/api/dashboard/charts/recovery-health', verifyToken, async (req, res, _next) => {
  try {
    const overdueInstallments = await prisma.installment.findMany({
      where: { status: 'overdue' },
      include: { booking: { include: { property: true } } }
    });
    const grouped = {};
    overdueInstallments.forEach(inst => {
      const propName = inst.booking?.property?.name || 'Unknown';
      grouped[propName] = (grouped[propName] || 0) + Number(inst.amount) - Number(inst.paid_amount);
    });
    const result = Object.keys(grouped).map(name => ({
      name,
      overdue: grouped[name]
    })).sort((a, b) => b.overdue - a.overdue).slice(0, 5);
    sendStandardResponse(res, result);
  } catch (err) { _next(err); }
});

app.get('/api/dashboard/charts/bookings', verifyToken, async (req, res, _next) => {
  try {
    const bookings = await prisma.booking.findMany();
    // Return last 7 days manually mapped
    const last7Days = Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const result = last7Days.map(dateStr => {
      const dayBookings = bookings.filter(b => b.date && b.date.startsWith(dateStr)).length;
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      return { name: dayName, bookings: dayBookings };
    });
    sendStandardResponse(res, result);
  } catch (err) { _next(err); }
});

app.get('/api/dashboard/charts/customer-growth', verifyToken, async (req, res, _next) => {
  try {
    const customers = await prisma.customer.findMany({ select: { createdAt: true } });
    const countsByYear = {};
    customers.forEach(c => {
      const year = new Date(c.createdAt).getFullYear();
      countsByYear[year] = (countsByYear[year] || 0) + 1;
    });
    const sortedYears = Object.keys(countsByYear).sort();
    let cumulative = 0;
    const result = sortedYears.map(year => {
      cumulative += countsByYear[year];
      return { name: year.toString(), customers: cumulative };
    });
    // Add current year if missing
    const tYear = new Date().getFullYear();
    if (!countsByYear[tYear] && Object.keys(countsByYear).length === 0) {
       result.push({ name: tYear.toString(), customers: 0 });
    }
    sendStandardResponse(res, result);
  } catch (err) { _next(err); }
});
// ============ AGENTS ============
app.get('/api/agents', verifyToken, async (req, res, _next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page -1) * limit;

    const agents = await prisma.agent.findMany({
      orderBy: { name: 'asc' },
      skip,
      take: limit
    });
    
    const total = await prisma.agent.count();
    
    sendStandardResponse(res, {
      data: agents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    _next(err);
  }
});

app.get('/api/agents-list', verifyToken, async (req, res, _next) => {
  try {
    const agents = await prisma.agent.findMany({ orderBy: { name: 'asc' } });
    sendStandardResponse(res, agents);
  } catch (err) {
    _next(err);
  }
});

app.post('/api/agents', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  const { name, phone, commission_rate } = req.body;
  try {
    const agent = await prisma.agent.create({
      data: { name, phone, commission_rate: commission_rate || 5 }
    });
    sendStandardResponse(res, agent);
  } catch (err) {
    next(err);
  }
});

app.put('/api/agents/:id', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.params.id;
    delete data.id;
    const agent = await prisma.agent.update({
      where: { id },
      data
    });
    sendStandardResponse(res, agent);
  } catch (err) {
    next(err);
  }
});

app.post('/api/agents/:id/payout', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  const { id } = req.params;
  const { amount, description, date } = req.body;
  const payoutDate = date || new Date().toISOString().split('T')[0];

  try {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (Number(agent.total_commission) < Number(amount)) {
      return res.status(400).json({ error: 'Insufficient commission balance' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Deduct from agent
      await tx.agent.update({
        where: { id },
        data: { total_commission: { decrement: amount } }
      });

      // 2. Primary Entry (Debit Expense - ID 9 Fallback)
      await tx.transaction.create({
        data: {
          date: payoutDate,
          debit: amount,
          credit: 0,
          description: `Agent Commission Payout: ${agent.name}. ${description || ''}`,
          category: 'Expense',
          account_id: 9 // Agent Expense
        }
      });

      // 3. Contra Entry (Credit Wallet)
      await tx.transaction.create({
        data: {
          date: payoutDate,
          debit: 0,
          credit: amount,
          description: `Auto-Offset: Commission Payout for ${agent.name}`,
          category: 'System Sync',
          account_id: 1 // Main Cash
        }
      });
    });

    await recordActivity('AGENT_PAYOUT', `Commission payout to ${agent.name} for Rs. ${amount}`, 'warning', req);
    sendStandardResponse(res, { message: 'Commission payout processed successfully.' });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/agents/:id', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  const { id } = req.params;
  try {
    const bookingCount = await prisma.booking.count({ where: { agent_id: id } });
    if (bookingCount > 0) {
      return sendStandardResponse(res, null, 400, `Cannot delete agent with ${bookingCount} active bookings. Archive instead.`);
    }
    await prisma.agent.delete({ where: { id } });
    await recordActivity('DELETE_AGENT', `Agent #${id} deleted`, 'caution', req);
    sendStandardResponse(res, { success: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/agents/:id/stats', verifyToken, async (req, res, _next) => {
  const agentId = req.params.id;
  try {
    const [bookingsCount, totalSales, totalCommission] = await Promise.all([
      prisma.booking.count({ where: { agent_id: agentId } }),
      prisma.booking.aggregate({
        where: { agent_id: agentId },
        _sum: { total: true }
      }),
      prisma.booking.findMany({
        where: { agent_id: agentId },
        select: { total: true, agent: { select: { commission_rate: true } } }
      })
    ]);

    const commissionSum = totalCommission.reduce((sum, b) => sum + (b.total * (b.agent?.commission_rate || 0) / 100), 0);

    sendStandardResponse(res, {
      bookings: bookingsCount,
      totalSales: totalSales._sum.total || 0,
      totalCommission: commissionSum
    });
  } catch (err) {
    _next(err);
  }
});

// ============ BOOKINGS ============
app.get('/api/bookings', verifyToken, async (req, res, _next) => {
  const { status } = req.query;
  try {
    const where = {};
    if (status && status !== 'all') where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        customer: { select: { name: true } },
        property: { select: { name: true } }
      }
    });

    const mappedBookings = bookings.map(b => ({
      ...b,
      customer: b.customer?.name,
      map: b.property?.name
    }));

    sendStandardResponse(res, mappedBookings);
  } catch (err) {
    _next(err);
  }
});

app.post('/api/bookings', verifyToken, validateCreateBooking, async (req, res, _next) => {
  const { 
    date, customer_id, plot_id, rate, total, advance, 
    installment_plan_months, agent_id 
  } = req.body;

  const booking_no = 'BKNO#' + Math.floor(Date.now() / 1000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the booking
      const booking = await tx.booking.create({
        data: {
          booking_no,
          date,
          customer_id,
          property_id: plot_id,
          rate,
          total,
          advance,
          status: 'in-progress',
          agent_id,
          no_of_installments: installment_plan_months || 0,
        }
      });

      // 2. Update plot status
      await tx.property.update({
        where: { id: plot_id },
        data: { status: 'booked' }
      });

      // 3. Create installments if needed
      if (installment_plan_months > 0) {
        const remaining = total - advance;
        const installmentAmount = Math.floor(remaining / installment_plan_months);
        const startDate = new Date(date);
        const installmentsData = [];

        for (let i = 1; i <= installment_plan_months; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + i);
          installmentsData.push({
            booking_id: booking.id,
            due_date: dueDate.toISOString().split('T')[0],
            amount: installmentAmount,
            status: 'pending'
          });
        }
        
        await tx.installment.createMany({
          data: installmentsData
        });
      }

      // 4. Create initial transaction for advance
      // 4. Create initial transaction for advance (Double-Entry)
      if (advance > 0) {
        const incomeAccountId = 8; // Installment Income
        const walletAccountId = 1; // Main Cash/Asset

        // Primary Entry (Credit Income)
        await tx.transaction.create({
          data: {
            date,
            debit: 0,
            credit: advance,
            description: `Booking Advance - ${booking_no}`,
            category: 'Income',
            customer_id,
            plot_id,
            account_id: incomeAccountId
          }
        });

        // Offset Entry (Debit Wallet)
        await tx.transaction.create({
          data: {
            date,
            debit: advance,
            credit: 0,
            description: `Auto-Offset: Booking Advance - ${booking_no}`,
            category: 'System Sync',
            customer_id,
            plot_id,
            account_id: walletAccountId
          }
        });
      }

      return booking;
    });

    sendStandardResponse(res, { id: result.id, booking_no: result.booking_no }, 201);
  } catch (err) {
    _next(err);
  }
});

app.get('/api/bookings/:id/installments', verifyToken, async (req, res, _next) => {
  try {
    const rows = await prisma.installment.findMany({
      where: { booking_id: req.params.id },
      orderBy: { due_date: 'asc' }
    });
    sendStandardResponse(res, rows);
  } catch (err) {
    _next(err);
  }
});

app.post('/api/installments/:id/pay', verifyToken, async (req, res, _next) => {
  const { id } = req.params;
  const { date, account_id, amount, customer_id, plot_id, description } = req.body;

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customer_id } });
    const account = await prisma.account.findUnique({ where: { id: parseInt(account_id) } });

    await prisma.pendingPayment.create({
      data: {
        date: date || new Date().toISOString().split('T')[0],
        from_account: customer?.name || 'Unknown Customer',
        to_account: account?.name || 'Unknown Account',
        credit: amount,
        debit: 0,
        description: `Installment Payment for Plot ID: ${plot_id}. [INSTALLMENT_ID:${id}] | ${description || ''}`,
        status: 'Pending'
      }
    });

    sendStandardResponse(res, { message: 'Installment payment request submitted for administrative approval.' });
  } catch (err) {
    _next(err);
  }
});

// ============ ACCOUNTS & FINANCIALS ============
app.get('/api/accounts', verifyToken, async (req, res, _next) => {
  const { type, category } = req.query;
  try {
    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;
    
    const rows = await prisma.account.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    sendStandardResponse(res, rows);
  } catch (err) {
    _next(err);
  }
});

app.post('/api/accounts', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  const { name, code, type } = req.body;
  try {
    const account = await prisma.account.create({
      data: { name, code, type }
    });
    sendStandardResponse(res, account);
  } catch (err) {
    _next(err);
  }
});

app.delete('/api/accounts/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  const id = parseInt(req.params.id);
  try {
    const txCount = await prisma.transaction.count({ where: { account_id: id } });
    if (txCount > 0) {
      return sendStandardResponse(res, null, 400, `Cannot delete account with ${txCount} historical transactions. Archive instead.`);
    }
    await prisma.account.delete({ where: { id } });
    sendStandardResponse(res, { success: true });
  } catch (err) {
    _next(err);
  }
});

app.post('/api/payments', verifyToken, validatePayment, async (req, res, _next) => {
  const { date, account_id, debit, credit, description, category, customer_id, plot_id } = req.body;
  const txDate = date || new Date().toISOString().split('T')[0];
  const amtDebit = debit || 0;
  const amtCredit = credit || 0;
  const cat = category || 'Operating';

  // Strict Double-Entry Engine Integration
  // Assume Account_ID: 1 is "Main Cash/Wallet Asset"
  const walletAccountId = 1;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Post the Primary Ledger Entry
      const primary = await tx.transaction.create({
        data: {
          date: txDate,
          account_id: parseInt(account_id),
          debit: amtDebit,
          credit: amtCredit,
          description,
          category: cat,
          customer_id,
          plot_id
        }
      });

      // 2. Post the Offsetting Contra-Entry to the Wallet
      await tx.transaction.create({
        data: {
          date: txDate,
          account_id: walletAccountId,
          debit: amtCredit, // Flip
          credit: amtDebit, // Flip
          description: `Double-Entry System Sync: Auto-Offset for Trx #${primary.id} [${description}]`,
          category: 'System Sync',
          customer_id,
          plot_id
        }
      });

      // 3. Update Customer aggregate totals if applicable
      if (customer_id && amtCredit > 0) {
        await tx.customer.update({
          where: { id: customer_id },
          data: {
            received: { increment: amtCredit },
            remaining: { decrement: amtCredit }
          }
        });
      }

      return primary;
    });

    sendStandardResponse(res, { id: result.id, double_entry_synced: true }, 201);
  } catch (err) {
    _next(err);
  }
});

app.post('/api/transfers', verifyToken, validateTransfer, async (req, res, _next) => {
  const { from_account_id, to_account_id, amount, description } = req.validated;
  const { date } = req.body;
  const txDate = date || new Date().toISOString().split('T')[0];

  try {
    await prisma.$transaction(async (tx) => {
      // Debit from source
      await tx.transaction.create({
        data: {
          date: txDate,
          account_id: parseInt(from_account_id),
          debit: amount,
          credit: 0,
          description: `Transfer Out: ${description}`,
          category: 'Transfer'
        }
      });

      // Credit to destination
      await tx.transaction.create({
        data: {
          date: txDate,
          account_id: parseInt(to_account_id),
          debit: 0,
          credit: amount,
          description: `Transfer In: ${description}`,
          category: 'Transfer'
        }
      });
    });
    sendStandardResponse(res, { success: true }, 201);
  } catch (err) {
    _next(err);
  }
});

app.get('/api/pending-payments', verifyToken, async (req, res, _next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const rows = await prisma.installment.findMany({
      where: {
        status: 'pending',
        due_date: { lt: today }
      },
      include: {
        booking: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { due_date: 'asc' }
    });

    const mappedRows = [
      ...rows.map(i => ({
        id: i.id,
        type: 'installment',
        date: i.due_date,
        from_account: i.booking?.customer?.name || 'Unknown',
        to_account: 'System Admin',
        debit: i.amount,
        credit: 0,
        description: `Overdue Installment for Booking ${i.booking?.booking_no}`
      }))
    ];

    // Also get general pending payments
    const pendingManual = await prisma.pendingPayment.findMany({ where: { status: 'Pending' } });
    const mappedManual = pendingManual.map(p => ({
      id: p.id,
      type: 'payment',
      date: p.date,
      from_account: p.from_account,
      to_account: p.to_account,
      debit: p.debit,
      credit: p.credit,
      description: p.description
    }));

    sendStandardResponse(res, [...mappedRows, ...mappedManual]);
  } catch (err) {
    _next(err);
  }
});

app.get('/api/receipt/:txId', verifyToken, async (req, res, _next) => {
  try {
    const row = await prisma.transaction.findUnique({
      where: { id: req.params.txId },
      include: {
        account: { select: { name: true } },
        customer: { select: { name: true, phone: true } },
        property: { select: { name: true } }
      }
    });

    if (!row) return sendStandardResponse(res, null, 404, 'Transaction not found');

    sendStandardResponse(res, {
      ...row,
      account_name: row.account?.name,
      customer_name: row.customer?.name,
      customer_phone: row.customer?.phone,
      plot_name: row.property?.name
    });
  } catch (err) {
    _next(err);
  }
});

// ============ FINANCIAL REPORTS ============
app.get('/api/reports/income-statement', verifyToken, async (req, res, _next) => {
  const { from, to } = req.query;
  try {
    const accounts = await prisma.account.findMany({
      where: { type: { in: ['income', 'expense'] } },
      include: {
        transactions: {
          where: {
            AND: [
              from ? { date: { gte: from } } : {},
              to ? { date: { lte: to } } : {}
            ]
          }
        }
      }
    });

    const rows = accounts.map(a => {
      const revenue = a.type === 'income' 
        ? a.transactions.reduce((sum, t) => sum + (t.credit - t.debit), 0)
        : 0;
      const expense = a.type === 'expense'
        ? a.transactions.reduce((sum, t) => sum + (t.debit - t.credit), 0)
        : 0;
      
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        revenue,
        expense
      };
    });

    sendStandardResponse(res, rows.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
  } catch (err) {
    _next(err);
  }
});

// ============ HIGH VALUE MODULES ============
app.get('/api/audit-logs', verifyToken, async (req, res, _next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    // map to UI format 
    const mapped = logs.map(l => ({
      id: l.id,
      action: l.action,
      user: l.user_name || 'System Admin',
      date: new Date(l.createdAt).toLocaleString(),
      details: l.details,
      severity: l.severity
    }));
    sendStandardResponse(res, mapped);
  } catch (err) {
    _next(err);
  }
});

app.get('/api/customers/:id/360-profile', verifyToken, async (req, res, _next) => {
  try {
    const customerId = req.params.id;
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        bookings: {
          include: {
            installments: true,
            property: true
          }
        }
      }
    });

    if (!customer) return sendStandardResponse(res, null, 404, 'Customer not found');

    let totalInvested = 0;
    let pendingDues = 0;
    let activeBookings = 0;

    customer.bookings.forEach(b => {
      if (b.status === 'in-progress' || b.status === 'confirmed') activeBookings++;
      b.installments.forEach(inst => {
        totalInvested += Number(inst.paid_amount || 0);
        if (inst.status === 'pending' || inst.status === 'overdue') {
          pendingDues += (Number(inst.amount) - Number(inst.paid_amount || 0));
        }
      });
      // add advance to total invested
      totalInvested += Number(b.advance || 0);
    });

    sendStandardResponse(res, {
      name: customer.name,
      phone: customer.phone || 'N/A',
      cnic: customer.cnic || 'N/A',
      address: customer.address || 'N/A',
      totalProperties: customer.bookings.length,
      totalInvested: `Rs. ${totalInvested.toLocaleString()}`,
      activeBookings,
      pendingDues: `Rs. ${pendingDues.toLocaleString()}`
    });
  } catch (err) {
    _next(err);
  }
});

app.get('/api/search', verifyToken, async (req, res, _next) => {
  const q = req.query.q || '';
  if (q.length < 3) return sendStandardResponse(res, []);
  
  try {
    const [customers, bookings, properties] = await Promise.all([
      prisma.customer.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 5
      }),
      prisma.booking.findMany({
        where: { booking_no: { contains: q, mode: 'insensitive' } },
        take: 5
      }),
      prisma.property.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 5
      })
    ]);


    const results = [
      ...customers.map(c => ({ type: 'Customer', data: { id: c.id, name: c.name, phone: c.phone || 'N/A' } })),
      ...bookings.map(b => ({ type: 'Booking', data: { id: b.id, name: b.booking_no, phone: b.status } })),
      ...properties.map(p => ({ type: 'Property', data: { id: p.id, name: p.name, phone: p.status } }))
    ];

    sendStandardResponse(res, results);
  } catch (err) {
    _next(err);
  }
});

app.post('/api/installments/simulate', verifyToken, (req, res) => {
  const { total_amount, advance, discount, months, start_date } = req.body;
  if (!months || months <= 0) return sendStandardResponse(res, []);
  
  const remaining = Number(total_amount || 0) - Number(advance || 0) - Number(discount || 0);
  if (remaining <= 0) return sendStandardResponse(res, []);

  const installmentAmount = Math.round(remaining / months);
  const startDate = new Date(start_date || new Date());
  const schedule = [];

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i);
    schedule.push({
      month: i,
      due_date: dueDate.toISOString().split('T')[0],
      amount: installmentAmount
    });
  }
  
  sendStandardResponse(res, schedule);
});

app.get('/api/reports/trial-balance', verifyToken, async (req, res, _next) => {
  const { from, to } = req.query;
  try {
    const accounts = await prisma.account.findMany({
      include: {
        transactions: {
          where: {
            AND: [
              from ? { date: { gte: from } } : {},
              to ? { date: { lte: to } } : {}
            ]
          }
        }
      }
    });

    const rows = accounts.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      debit: a.transactions.reduce((sum, t) => sum + t.debit, 0),
      credit: a.transactions.reduce((sum, t) => sum + t.credit, 0)
    }));

    sendStandardResponse(res, rows.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
  } catch (err) {
    _next(err);
  }
});

app.get('/api/reports/balance-sheet', verifyToken, async (req, res, _next) => {
  const { from, to } = req.query;
  try {
    const accounts = await prisma.account.findMany({
      include: {
        transactions: {
          where: {
            AND: [
              from ? { date: { gte: from } } : {},
              to ? { date: { lte: to } } : {}
            ]
          }
        }
      }
    });

    const rows = accounts.map(a => {
      const debitSum = a.transactions.reduce((sum, t) => sum + t.debit, 0);
      const creditSum = a.transactions.reduce((sum, t) => sum + t.credit, 0);
      const rawBalance = debitSum - creditSum;

      // Balance logic: For assets, balance = debit - credit. 
      // For liabilities and equity, balance = credit - debit.
      const balance = (a.type === 'liability' || a.type === 'equity' || a.type === 'income') 
                 ? -rawBalance // Invert calculation for Credit-normal accounts
                 : rawBalance; // Normal for Asset/Expense
      
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        balance
      };
    });

    sendStandardResponse(res, rows.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
  } catch (err) {
    _next(err);
  }
});

// ============ CUSTOMERS ============
app.get('/api/customers', verifyToken, async (req, res, _next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { search } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cnic: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Optional: Filter for land customers specifically if needed
    // if (type === 'land') where.acre = { gt: 0 };

    const [rows, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    sendStandardResponse(res, {
      data: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    _next(err);
  }
});

// Note: /api/land-customers is implemented directly below (removed janky alias)

// Implementation of land-customers
app.get('/api/land-customers', verifyToken, async (req, res, _next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { search } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.customer.count({ where })
    ]);

    sendStandardResponse(res, { data: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) }});
  } catch (err) { _next(err); }
});

app.post(['/api/customers', '/api/land-customers'], verifyToken, async (req, res, _next) => {
  try {
    const data = req.body;
    // Map 'acreage' from frontend to 'acre' in DB if needed
    if (data.acreage !== undefined) data.acre = parseFloat(data.acreage);
    delete data.acreage;

    // Convert numeric fields from strings/numbers to Prisma Decimal
    const numericFields = ['acre', 'kanal', 'marla', 'receivable', 'received', 'remaining', 'short_amount'];
    numericFields.forEach(f => {
       if (data[f] !== undefined) data[f] = parseFloat(data[f]) || 0;
    });

    const customer = await prisma.customer.create({ data });
    sendStandardResponse(res, customer);
  } catch (err) { _next(err); }
});

app.put(['/api/customers/:id', '/api/land-customers/:id'], verifyToken, async (req, res, _next) => {
  try {
    const data = req.body;
    const id = req.params.id;
    
    const numericFields = ['acre', 'kanal', 'marla', 'receivable', 'received', 'remaining', 'short_amount'];
    numericFields.forEach(f => {
       if (data[f] !== undefined) data[f] = parseFloat(data[f]) || 0;
    });
    
    // Cleanup id from body if present
    delete data.id;

    const customer = await prisma.customer.update({
      where: { id },
      data
    });
    sendStandardResponse(res, customer);
  } catch (err) { _next(err); }
});

app.delete(['/api/customers/:id', '/api/land-customers/:id'], verifyToken, checkRole(['Super Admin', 'Admin']), async (req, res, _next) => {
  const { id } = req.params;
  try {
    const [bookingCount, txCount] = await Promise.all([
      prisma.booking.count({ where: { customer_id: id } }),
      prisma.transaction.count({ where: { customer_id: id } })
    ]);

    if (bookingCount > 0 || txCount > 0) {
      return sendStandardResponse(res, null, 400, 
        `Cannot delete customer with ${bookingCount} bookings and ${txCount} ledger entries.`
      );
    }

    await prisma.customer.delete({ where: { id } });
    await recordActivity('DELETE_CUSTOMER', `Customer #${id} deleted`, 'caution', req);
    sendStandardResponse(res, { success: true });
  } catch (err) {
    _next(err);
  }
});

app.get('/api/ledger/customer/:id', verifyToken, async (req, res, _next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [currentRows, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { customer_id: req.params.id },
        skip,
        take: limit,
        include: { account: { select: { name: true } } },
        orderBy: [{ date: 'asc' }, { id: 'asc' }]
      }),
      prisma.transaction.count({ where: { customer_id: req.params.id } })
    ]);

    // Calculate opening balance: sum all transactions before the first record of the current page
    let openingBalance = 0;
    const firstRecordOfPage = currentRows[0];
    
    if (firstRecordOfPage) {
       const opBalAgg = await prisma.transaction.aggregate({
         where: { 
           customer_id: req.params.id,
           OR: [
             { date: { lt: firstRecordOfPage.date } },
             { AND: [
                 { date: firstRecordOfPage.date }, 
                 { id: { lt: firstRecordOfPage.id } }
               ] 
             }
           ]
         },
         _sum: { debit: true, credit: true }
       });
       openingBalance = (Number(opBalAgg._sum.credit) || 0) - (Number(opBalAgg._sum.debit) || 0);
    } else if (skip > 0) {
      // If we are on a page with no data but it's not the first page, 
      // we might still want the final balance.
      const opBalAgg = await prisma.transaction.aggregate({
        where: { customer_id: req.params.id },
        _sum: { debit: true, credit: true }
      });
      openingBalance = (Number(opBalAgg._sum.credit) || 0) - (Number(opBalAgg._sum.debit) || 0);
    }

    let runningBalance = openingBalance;
    const data = currentRows.map(r => {
      runningBalance += (Number(r.credit) - Number(r.debit));
      return { 
        ...r, 
        account_name: r.account?.name,
        runningBalance 
      };
    });

    sendStandardResponse(res, {
      data,
      openingBalance,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    _next(err);
  }
});

// ============ PENDING PAYMENTS ============
app.get('/api/pending-payments/table', verifyToken, async (req, res, _next) => {
  try {
    const rows = await prisma.pendingPayment.findMany({
      where: { status: 'Pending' },
      orderBy: { id: 'desc' }
    });
    sendStandardResponse(res, rows);
  } catch (err) {
    _next(err);
  }
});

app.post('/api/pending-payments/approve/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try {
    const row = await prisma.pendingPayment.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!row) return sendStandardResponse(res, null, 404, 'Pending payment not found');

    // Check if this is an installment payment
    const instMatch = row.description?.match(/\[INSTALLMENT_ID:(\d+)\]/);
    const installmentId = instMatch ? parseInt(instMatch[1]) : null;

    await prisma.$transaction(async (tx) => {
      // 1. Update status
      await tx.pendingPayment.update({
        where: { id: row.id },
        data: { status: 'Approved' }
      });

      let customerId = null;
      let plotId = null;

      // 2. If installment, handle installment and customer totals
      if (installmentId) {
        const installment = await tx.installment.findUnique({
          where: { id: installmentId },
          include: { booking: true }
        });

        if (installment) {
          await tx.installment.update({
            where: { id: installmentId },
            data: { status: 'paid', paid_amount: row.credit }
          });

          customerId = installment.booking.customer_id;
          plotId = installment.booking.property_id;

          if (customerId) {
            await tx.customer.update({
              where: { id: customerId },
              data: {
                received: { increment: row.credit },
                remaining: { decrement: row.credit }
              }
            });
          }
        }
      }

      // 3. Create transaction record (Balanced Pair)
      const walletAccountId = 1; // Main Cash
      
      // If it's an installment, we typically credit the Installment Income account (8)
      const targetAccountId = installmentId ? 8 : null;

      await tx.transaction.create({
        data: {
          date: new Date().toISOString().split('T')[0],
          debit: row.debit || 0,
          credit: row.credit || 0,
          description: `Payment Approved: ${row.to_account} (From: ${row.from_account}). Ref: ${row.description}`,
          category: 'Operating',
          customer_id: customerId,
          plot_id: plotId,
          account_id: targetAccountId
        }
      });

      // Contra Entry to Wallet
      await tx.transaction.create({
        data: {
          date: new Date().toISOString().split('T')[0],
          debit: row.credit || 0, // Flip
          credit: row.debit || 0, // Flip
          description: `Auto-Offset: Approved Payment Sync (Ref: ${row.description})`,
          category: 'System Sync',
          customer_id: customerId,
          plot_id: plotId,
          account_id: walletAccountId
        }
      });
    });

    await recordActivity('PAYMENT_APPROVED', `Payment #${row.id} approved for amount ${row.credit || row.debit}`, 'warning', req);
    sendStandardResponse(res, { success: true, message: "Payment approved and synchronized with ledger." });
  } catch (err) {
    _next(err);
  }
});

app.post('/api/pending-payments/reject/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try {
    await prisma.pendingPayment.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Rejected' }
    });
    sendStandardResponse(res, { success: true, message: 'Payment request rejected.' });
  } catch (err) {
    _next(err);
  }
});

// ============ TRANSFER REQUESTS ============
app.get('/api/transfer-requests', verifyToken, async (req, res, _next) => {
  try {
    const rows = await prisma.transferRequest.findMany({
      where: { status: 'Pending' },
      orderBy: { id: 'desc' }
    });
    sendStandardResponse(res, rows);
  } catch (err) {
    _next(err);
  }
});

app.post('/api/transfer-requests/approve/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try {
    const row = await prisma.transferRequest.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!row) return sendStandardResponse(res, null, 404, 'Transfer request not found');

    await prisma.$transaction(async (tx) => {
      // 1. Update status
      await tx.transferRequest.update({
        where: { id: row.id },
        data: { status: 'Approved' }
      });

      const date = new Date().toISOString().split('T')[0];
      const amount = row.credit || row.debit;

      // 2. Record Debit (outflow)
      await tx.transaction.create({
        data: {
          date,
          debit: amount,
          credit: 0,
          description: `Internal Transfer Out: To ${row.to_account}. Ref: ${row.description}`,
          category: 'Operating'
        }
      });

      // 3. Record Credit (inflow)
      await tx.transaction.create({
        data: {
          date,
          debit: 0,
          credit: amount,
          description: `Internal Transfer In: From ${row.from_account}. Ref: ${row.description}`,
          category: 'Operating'
        }
      });
    });
    sendStandardResponse(res, { message: 'Transfer approved and transactions recorded' });
  } catch (err) {
    _next(err);
  }
});

app.post('/api/transfer-requests/reject/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try {
    await prisma.transferRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'Rejected' }
    });
    sendStandardResponse(res, { success: true });
  } catch (err) {
    _next(err);
  }
});

// ============ REPORTS ============
app.get('/api/report/customer-recovery', verifyToken, async (req, res, _next) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        bookings: {
          include: {
            installments: {
              where: { status: 'pending' }
            }
          }
        }
      }
    });

    const rows = customers.map(c => {
      let short_amount = 0;
      let pending_installments = 0;
      c.bookings.forEach(b => {
        b.installments.forEach(i => {
          short_amount += i.amount;
          pending_installments++;
        });
      });
      return {
        id: c.id,
        customer_name: c.name,
        short_amount,
        pending_installments
      };
    }).filter(r => r.short_amount > 0);

    sendStandardResponse(res, rows);
  } catch (err) {
    _next(err);
  }
});



app.get('/api/reports/cashflow-statement', verifyToken, async (req, res, _next) => {
  const { from, to } = req.query;
  try {
    const openingBalanceTx = await prisma.transaction.aggregate({
      where: { date: { lt: from || '1970-01-01' } },
      _sum: { credit: true, debit: true }
    });

    const openingBalance = (openingBalanceTx._sum.credit || 0) - (openingBalanceTx._sum.debit || 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        AND: [
          from ? { date: { gte: from } } : {},
          to ? { date: { lte: to } } : {}
        ]
      },
      include: { account: true }
    });

    const resData = { 
      operating: [], investing: [], financing: [], transfers: [],
      openingBalance, 
      closingBalance: openingBalance,
      netOperating: 0, netInvesting: 0, netFinancing: 0
    };

    transactions.forEach(t => {
      const item = { id: t.id, date: t.date, description: t.description, debit: t.debit, credit: t.credit };
      const type = t.account?.type;

      if (type === 'income' || type === 'expense') {
        resData.operating.push(item);
        resData.netOperating += (t.credit - t.debit);
      } else if (type === 'asset') {
        resData.investing.push(item);
        resData.netInvesting += (t.credit - t.debit);
      } else if (t.category === 'Transfer') {
        resData.transfers.push(item);
      } else {
        resData.financing.push(item);
        resData.netFinancing += (t.credit - t.debit);
      }
      resData.closingBalance += (t.credit - t.debit);
    });

    sendStandardResponse(res, resData);
  } catch (err) {
    _next(err);
  }
});

// ============ MAP/PLOTS ============
app.get('/api/map', verifyToken, async (req, res, next) => {
  const { townId } = req.query;
  try {
    const where = townId ? { town_id: parseInt(townId) } : {};
    const rows = await prisma.property.findMany({ 
      where,
      include: {
        bookings: {
          where: { status: 'In-Progress' },
          include: { customer: { select: { name: true } } },
          take: 1
        }
      },
      orderBy: { id: 'asc' } 
    });
    
    // Map bookings to a simpler format for the UI
    const mapped = rows.map(r => ({
      ...r,
      owner: r.bookings[0]?.customer?.name || null
    }));
    
    sendStandardResponse(res, mapped);
  } catch (err) {
    next(err);
  }
});

app.post('/api/map', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  const { name, marla, dimensions, status, price, town_id } = req.body;
  try {
    const plot = await prisma.property.create({
      data: {
        name,
        marla,
        dimensions,
        status: status || 'available',
        price: price || 0,
        town_id: town_id ? parseInt(town_id) : null
      }
    });
    sendStandardResponse(res, plot);
  } catch (err) {
    _next(err);
  }
});

// Property Dossier: Forensic Data for a single plot
app.get('/api/plots/:id/dossier', verifyToken, async (req, res, next) => {
  try {
    const plot = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        town: true,
        bookings: {
          include: {
            customer: true,
            installments: { orderBy: { due_date: 'asc' } },
            agent: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!plot) return sendStandardResponse(res, null, 404, 'Property not found');

    const booking = plot.bookings[0];
    const totalPaid = booking?.installments.reduce((acc, inst) => acc + Number(inst.paid_amount), 0) || 0;
    const totalDue = Number(booking?.total || 0);
    const nextInstallment = booking?.installments.find(i => i.status === 'pending');

    sendStandardResponse(res, {
      ...plot,
      dossier: booking ? {
        customer: booking.customer,
        recoveryProgress: totalDue > 0 ? (totalPaid / totalDue) * 100 : 0,
        totalPaid,
        totalDue,
        nextInstallment,
        agent: booking.agent
      } : null
    });
  } catch (err) {
    next(err);
  }
});

// ============ VISITORS ============
app.get('/api/visitors', verifyToken, async (req, res, _next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cnic: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' }
      }),
      prisma.visitor.count({ where })
    ]);

    sendStandardResponse(res, {
      data: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { _next(err); }
});

app.post('/api/visitors', verifyToken, async (req, res, _next) => {
  try {
    const visitor = await prisma.visitor.create({ data: req.body });
    sendStandardResponse(res, visitor, 201);
  } catch (err) { _next(err); }
});

// ============ USERS & ROLES ============
app.get('/api/users', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, status: true },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.user.count()
    ]);

    sendStandardResponse(res, {
      data: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/users', verifyToken, checkRole(['Super Admin']), validateCreateUser, async (req, res, next) => {
  const { name, email, role } = req.validated;
  const { mobile_no, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password || 'admin123', 10);
  
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        mobile_no,
        password: hashedPassword,
        status: 1
      }
    });
    sendStandardResponse(res, { id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

app.put('/api/users/:id', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.params.id;
    delete data.id;

    if (data.password) {
      data.password = bcrypt.hashSync(data.password, 10);
    } else {
      delete data.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data
    });
    sendStandardResponse(res, { id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

app.put('/api/users/:id/toggle', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return sendStandardResponse(res, null, 404, 'User not found');
    await prisma.user.update({ where: { id: user.id }, data: { status: user.status === 1 ? 0 : 1 } });
    sendStandardResponse(res, { success: true });
  } catch (err) { next(err); }
});

app.delete('/api/users/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try {
    const id = req.params.id;
    // Check if user has a wallet or other dependencies if needed
    // For now, let's just use a safe delete with a clear error
    await prisma.user.delete({ where: { id } });
    await recordActivity('DELETE_USER', `User #${id} deleted`, 'caution', req);
    sendStandardResponse(res, { success: true });
  } catch (err) { 
    _next(err); 
  }
});

// ============ TOKENS ============
app.get('/api/tokens', verifyToken, async (req, res, _next) => {
  const { status } = req.query;
  try {
    const where = {};
    if (status && status !== 'all') where.status = status;
    const tokens = await prisma.token.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { property: { select: { name: true } } }
    });
    const mapped = tokens.map(t => ({
      id: t.id,
      no: t.token_no,
      customer: t.customer_name,
      map: t.property?.name,
      rate: Number(t.rate),
      total: Number(t.total_amount),
      tokenAmt: Number(t.token_amount),
      remaining: Number(t.remaining),
      due: t.due_date,
      status: t.status?.toLowerCase() || 'in-progress',
      token_no: t.token_no,
      customer_name: t.customer_name,
      plot_name: t.property?.name
    }));
    sendStandardResponse(res, mapped);
  } catch (err) { _next(err); }
});

app.get('/api/tokens/stats', verifyToken, async (req, res, _next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayTokens = await prisma.token.count({ where: { due_date: today } });
    const totalTokens = await prisma.token.count();
    const agg = await prisma.token.aggregate({ _sum: { token_amount: true } });
    sendStandardResponse(res, { todayTotal: Number(agg._sum.token_amount || 0), todayTokens: todayTokens || totalTokens });
  } catch (err) { _next(err); }
});

app.post('/api/tokens', verifyToken, async (req, res, _next) => {
  const { plot_id, customer_name, rate, total_amount, token_amount, remaining, due_date } = req.body;
  const token_no = 'TKN#' + Math.floor(Date.now() / 1000);
  const date = new Date().toISOString().split('T')[0];

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Token
      const token = await tx.token.create({
        data: {
          token_no,
          plot_id,
          customer_name,
          rate: Number(rate),
          total_amount: Number(total_amount),
          token_amount: Number(token_amount),
          remaining: Number(remaining),
          due_date,
          status: 'In-Progress'
        }
      });

      // 2. Update Property status
      await tx.property.update({
        where: { id: plot_id },
        data: { status: 'token' }
      });

      // 3. Double-entry accounting for token amount received
      if (Number(token_amount) > 0) {
        const incomeAccountId = 8; // Installment/Token Income
        const walletAccountId = 1; // Main Cash/Asset

        await tx.transaction.create({
          data: {
            date,
            debit: 0,
            credit: Number(token_amount),
            description: `Token Advance Received - ${token_no}`,
            category: 'Income',
            plot_id,
            account_id: incomeAccountId
          }
        });

        await tx.transaction.create({
          data: {
            date,
            debit: Number(token_amount),
            credit: 0,
            description: `Auto-Offset: Token Advance - ${token_no}`,
            category: 'System Sync',
            plot_id,
            account_id: walletAccountId
          }
        });
      }

      return token;
    });

    sendStandardResponse(res, result, 201);
  } catch (err) {
    _next(err);
  }
});

// ============ CUSTOMERS-LIST (flat array for dropdowns) ============
app.get('/api/customers-list', verifyToken, async (req, res, _next) => {
  try {
    const rows = await prisma.customer.findMany({
      select: { id: true, name: true, phone: true },
      orderBy: { name: 'asc' }, take: 200
    });
    sendStandardResponse(res, rows);
  } catch (err) { _next(err); }
});

// ============ TOWNS ============
app.get('/api/towns', verifyToken, async (req, res, _next) => {
  try { sendStandardResponse(res, await prisma.town.findMany({ orderBy: { name: 'asc' } })); }
  catch (err) { _next(err); }
});

app.post('/api/towns', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try { sendStandardResponse(res, await prisma.town.create({ data: req.body })); }
  catch (err) { _next(err); }
});

app.put('/api/towns/:id/toggle', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  try {
    const town = await prisma.town.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!town) return sendStandardResponse(res, null, 404, 'Town not found');
    await prisma.town.update({ where: { id: town.id }, data: { status: town.status === 1 ? 0 : 1 } });
    sendStandardResponse(res, { success: true });
  } catch (err) { next(err); }
});

app.put('/api/towns/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try {
    const data = req.body;
    delete data.id;
    const town = await prisma.town.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    sendStandardResponse(res, town);
  } catch (err) { _next(err); }
});

app.delete('/api/towns/:id', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.town.delete({ where: { id } });
    await recordActivity('DELETE_TOWN', `Town #${id} deleted`, 'caution', req);
    sendStandardResponse(res, { success: true });
  } catch (err) {
    next(err);
  }
});

// ============ TOWN OWNERS ============
app.get('/api/town-owners', verifyToken, async (req, res, _next) => {
  try { sendStandardResponse(res, await prisma.townOwner.findMany({ orderBy: { name: 'asc' } })); }
  catch (err) { _next(err); }
});

app.post('/api/town-owners', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try { sendStandardResponse(res, await prisma.townOwner.create({ data: req.body })); }
  catch (err) { _next(err); }
});

app.put('/api/town-owners/:id', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  try {
    const data = req.body;
    delete data.id;
    const owner = await prisma.townOwner.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    sendStandardResponse(res, owner);
  } catch (err) { next(err); }
});

app.delete('/api/town-owners/:id', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    // Basic check for town ownership records if any (optional if town model links directly)
    await prisma.townOwner.delete({ where: { id } });
    sendStandardResponse(res, { success: true });
  } catch (err) {
    next(err);
  }
});

// ============ LAND OWNERS ============
app.get('/api/land-owners', verifyToken, async (req, res, _next) => {
  try { sendStandardResponse(res, await prisma.landOwner.findMany({ orderBy: { name: 'asc' } })); }
  catch (err) { _next(err); }
});

app.post('/api/land-owners', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try { sendStandardResponse(res, await prisma.landOwner.create({ data: req.body })); }
  catch (err) { _next(err); }
});

app.put('/api/land-owners/:id', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  try {
    const data = req.body;
    delete data.id;
    const owner = await prisma.landOwner.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    sendStandardResponse(res, owner);
  } catch (err) { next(err); }
});

app.delete('/api/land-owners/:id', verifyToken, checkRole(['Super Admin']), async (req, res, next) => {
  try {
    await prisma.landOwner.delete({ where: { id: parseInt(req.params.id) } });
    sendStandardResponse(res, { success: true });
  } catch (err) { next(err); }
});



// ============ WALLET ADMIN ============
app.get('/api/users/stats/:id', verifyToken, async (req, res, _next) => {
  try {
    const wallet = await prisma.wallet.findFirst({ where: { userId: req.params.id } });
    if (!wallet) return sendStandardResponse(res, { balance: 0, totalDebit: 0, totalCredit: 0 });
    sendStandardResponse(res, { balance: Number(wallet.balance), totalDebit: Number(wallet.totalDebit), totalCredit: Number(wallet.totalCredit) });
  } catch (err) { _next(err); }
});

app.get('/api/users/transactions/:id', verifyToken, async (req, res, _next) => {
  try {
    const transactions = await prisma.transaction.findMany({ orderBy: { date: 'desc' }, take: 50 });
    sendStandardResponse(res, transactions.map(t => ({ id: t.id, date: t.date, debit: Number(t.debit), credit: Number(t.credit), balance: Number(t.balance || 0), description: t.description })));
  } catch (err) { _next(err); }
});

// ============ DECADE FISCAL REPORT ============
app.get('/api/reports/decade-fiscal', verifyToken, async (req, res, _next) => {
  try {
    const transactions = await prisma.transaction.findMany();
    const byYear = {};
    transactions.forEach(t => {
      const year = t.date ? t.date.substring(0, 4) : 'Unknown';
      if (!byYear[year]) byYear[year] = { revenue: 0, expense: 0 };
      byYear[year].revenue += Number(t.credit || 0);
      byYear[year].expense += Number(t.debit || 0);
    });
    const yearlyTrends = Object.keys(byYear).sort().map(year => ({ year, revenue: byYear[year].revenue, profit: byYear[year].revenue - byYear[year].expense }));
    const totalRevenue = yearlyTrends.reduce((s, y) => s + y.revenue, 0);
    const totalProfit = yearlyTrends.reduce((s, y) => s + y.profit, 0);
    sendStandardResponse(res, { yearlyTrends, totalRevenue, totalProfit });
  } catch (err) { _next(err); }
});

// ============ TOWN OWNER AUDIT ============
app.get('/api/reports/town-owner-audit', verifyToken, async (req, res, _next) => {
  try {
    const owners = await prisma.townOwner.findMany();
    sendStandardResponse(res, owners.map((o, idx) => ({ id: o.id, owner: o.name, date: new Date().toISOString().split('T')[0], amount: Number(o.acre || 0) * 500000, reference: `REF-${o.id}-${idx}`, status: 'verified' })));
  } catch (err) { _next(err); }
});

// FINANCIAL RISK: Recovery Aging Report
app.get('/api/reports/recovery-risk', verifyToken, async (req, res, _next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const customers = await prisma.customer.findMany({
      include: {
        bookings: {
          where: { status: 'In-Progress' },
          include: {
            installments: {
              where: { status: 'pending', due_date: { lt: today } },
              orderBy: { due_date: 'asc' }
            }
          }
        }
      }
    });

    const riskReport = customers.map(c => {
      let maxDelayDays = 0;
      let overdueAmount = 0;
      
      c.bookings.forEach(b => {
        b.installments.forEach(inst => {
          const delay = Math.floor((new Date(today) - new Date(inst.due_date)) / (1000 * 60 * 60 * 24));
          if (delay > maxDelayDays) maxDelayDays = delay;
          overdueAmount += Number(inst.amount);
        });
      });

      let riskLevel = 'Standard';
      if (maxDelayDays > 60) riskLevel = 'Critical';
      else if (maxDelayDays > 30) riskLevel = 'High';
      else if (maxDelayDays > 0) riskLevel = 'Medium';

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        maxDelayDays,
        overdueAmount,
        riskLevel
      };
    }).filter(r => r.maxDelayDays > 0)
      .sort((a, b) => b.maxDelayDays - a.maxDelayDays);

    sendStandardResponse(res, riskReport);
  } catch (err) {
    _next(err);
  }
});

// ============ INSTALLMENT TYPES ============
app.get('/api/installment-types', verifyToken, async (req, res, _next) => {
  try { sendStandardResponse(res, await prisma.installmentType.findMany({ orderBy: { name: 'asc' } })); }
  catch (err) { _next(err); }
});

app.post('/api/installment-types', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  try { sendStandardResponse(res, await prisma.installmentType.create({ data: { name: req.body.name } })); }
  catch (err) { _next(err); }
});

// ============ ROLES & PERMISSIONS ============
app.get('/api/roles', verifyToken, async (req, res, _next) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    sendStandardResponse(res, roles);
  } catch (err) { _next(err); }
});

app.post('/api/roles', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  const { name, permissions } = req.body;
  try {
    const role = await prisma.role.create({
      data: { 
        name, 
        permissions: permissions ? JSON.stringify(permissions) : null 
      }
    });
    sendStandardResponse(res, role);
  } catch (err) { _next(err); }
});

app.put('/api/roles/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  const { id } = req.params;
  const { name, permissions } = req.body;
  try {
    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        permissions: permissions ? JSON.stringify(permissions) : null 
      }
    });
    
    // Forensic Logging
    await recordActivity(
      'Authority Matrix Modified', 
      `Directive [${name}] updated with new granular permissions by Admin.`, 
      'caution', 
      req
    );

    sendStandardResponse(res, role);
  } catch (err) { _next(err); }
});

app.delete('/api/roles/:id', verifyToken, checkRole(['Super Admin']), async (req, res, _next) => {
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });
    if (['Super Admin', 'Viewer'].includes(role.name)) {
      return sendStandardResponse(res, null, 400, "Protected system roles cannot be deleted.");
    }
    await prisma.role.delete({ where: { id: parseInt(id) } });
    sendStandardResponse(res, { success: true });
  } catch (err) { _next(err); }
});

// DUPLICATE REMOVED - Logic moved to line 1796 to match standard route grouping.


// ============ CENTRALIZED ERROR HANDLER ============
// Must be the last middleware. Hides internal error details from clients.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const status = err.status || err.statusCode || 500;

  // Log full error server-side
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (isDev) console.error(err.stack);

  // Use standardized response for errors
  sendStandardResponse(res, null, status, isDev ? err : 'An internal server error occurred. Please try again.');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
