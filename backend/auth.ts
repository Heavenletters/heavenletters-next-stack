import { createAuth } from '@keystone-6/auth';
import { statelessSessions } from '@keystone-6/core/session';

let sessionSecret = process.env.KEYSTONE_SECRET;
if (!sessionSecret) {
  sessionSecret = 'abcdefghijklmnopqrstuvwxyz1234567890';
}

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  // Temporarily disabled for testing - initFirstItem can cause startup hangs
  // initFirstItem: {
  //   fields: ['name', 'email', 'password', 'role'],
  //   itemData: {
  //     role: 'admin',
  //   },
  // },
  passwordResetLink: {
    sendToken: async ({ token, identity }) => {
      // TODO: Implement email sending for password reset
      console.log(`Password reset for ${identity}: ${token}`);
      // In production, send email with this token
    },
    tokensValidForMins: 60, // 1 hour
  },
});

const sessionMaxAge = 8 * 60 * 60; // 8 hours for better security

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret!,
});

export { withAuth, session };