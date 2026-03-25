import { AuthForm } from "@/features/auth/auth-form";
import { UzbekLandscapeArt } from "@/features/auth/uzbek-landscape-art";

export function AuthPage() {
  return (
    <div className="h-screen overflow-hidden bg-surface px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <section className="flex h-full items-center justify-center">
          <div className="w-full max-w-[30rem]">
            <AuthForm />
          </div>
        </section>
        <section className="hidden h-full lg:block">
          <UzbekLandscapeArt />
        </section>
      </div>
    </div>
  );
}
