import re

# Read file
with open('c:/Users/DBU/company/review/client/src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# 1. Add Bell to imports
content = content.replace(
    '  Building2,\n  LogOut,',
    '  Bell,\n  Building2,\n  LogOut,'
)

# 2. Add unreadCount to useAuth destructuring
content = content.replace(
    'const { user, logout } = useAuth();',
    'const { user, logout, unreadCount } = useAuth();'
)

# 3. Add notification bell after dark mode toggle, before user section
old_pattern = '{user ? (\n                <>\n                  {/* Desktop User Menu */}'
new_code = '{user ? (\n                <>\n                  {/* Notification Bell */}\n                  <Link\n                    to={isAdmin ? "/admin/reports" : "/notifications"}\n                    className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"\n                  >\n                    <Bell className="h-5 w-5" />\n                    {typeof unreadCount === \'number\' && unreadCount > 0 && (\n                      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">\n                        {unreadCount > 99 ? \'99+\' : unreadCount}\n                      </span>\n                    )}\n                  </Link>\n\n                  {/* Desktop User Menu */}'

content = content.replace(old_pattern, new_code)

# Write file
with open('c:/Users/DBU/company/review/client/src/components/Navbar.tsx', 'w') as f:
    f.write(content)

print('Navbar.tsx updated successfully')

