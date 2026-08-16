import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-zinc-500">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
