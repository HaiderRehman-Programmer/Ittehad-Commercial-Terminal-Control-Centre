import React from 'react';

/**
 * @typedef {Object} PermissionWrapperProps
 * @property {string[]} [allowedRoles=[]] - List of roles that can see the children
 * @property {string} [module] - The module ID to check granular permissions for
 * @property {string} [minLevel='viewer'] - Minimum permission level required
 * @property {React.ReactNode} children - The UI elements to protect
 * @property {boolean} [fallback=false] - Whether to show nothing or a "Forbidden" message
 */

/** @param {PermissionWrapperProps} props */
const PermissionWrapper = ({ allowedRoles = [], module, minLevel = 'viewer', children, fallback = false }) => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
  const user = JSON.parse(userStr);
  const userRole = user.role || 'Guest';
  const permissions = user.permissions || {};

  // Super Admin can see everything
  if (userRole === 'Super Admin') return <>{children}</>;

  // Check role-based access first
  const isRoleAllowed = allowedRoles.length === 0 || allowedRoles.includes(userRole);
  
  // Check module-granular access if module is provided
  let isModuleAllowed = true;
  if (module && permissions[module]) {
    const levels = ['none', 'viewer', 'operator', 'auditor', 'super'];
    const userLevelIndex = levels.indexOf(permissions[module]);
    const minLevelIndex = levels.indexOf(minLevel);
    isModuleAllowed = userLevelIndex >= minLevelIndex && userLevelIndex !== 0;
  } else if (module) {
    // If a module is required but not in permissions list (and not super admin), deny
    isModuleAllowed = false;
  }

  const isAllowed = isRoleAllowed && isModuleAllowed;

  if (!isAllowed) {
    return fallback ? (
      <div className="p-8 border-2 border-dashed border-rose-100 bg-rose-50/30 rounded-[2rem] text-center group cursor-not-allowed">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
           <Shield size={20} strokeWidth={3} />
        </div>
        <h3 className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-1">Access Restricted</h3>
        <p className="text-[9px] text-rose-400 font-bold uppercase tracking-tight">Requires {module ? `[${module.toUpperCase()}:${minLevel.toUpperCase()}]` : allowedRoles.join(' or ')} directive</p>
      </div>
    ) : null;
  }

  return <>{children}</>;
};

export default PermissionWrapper;
