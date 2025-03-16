'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Logo from '@/components/Logo';

// Haupt-Login-Seite, die den Suspense-Boundary bereitstellt
const LoginPage: React.FC = () => {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
};

// Einfaches Skeleton-Loading für den Suspense-Fallback
const LoginSkeleton = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="h-8 bg-gray-300/20 rounded mb-6"></div>
        <div className="h-10 bg-gray-300/20 rounded mb-4"></div>
        <div className="h-10 bg-gray-300/20 rounded mb-4"></div>
        <div className="h-10 bg-gray-300/20 rounded"></div>
      </div>
    </div>
  );
};

// Innere Komponente, die useSearchParams verwendet
const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [randomImageNumber, setRandomImageNumber] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Prüfen, ob der Benutzer gerade registriert wurde
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Registrierung erfolgreich! Bitte melden Sie sich an.');
    }
  }, [searchParams]);
	
  const handleNextStep = () => {
    setCurrentStep(2);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
    } else {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password
        });
        
        if (result?.error) {
          throw new Error(result.error);
        }
        
        if (result?.ok) {
          // Weiterleitung zur Startseite nach erfolgreicher Anmeldung
          router.push('/');
        }
      } catch (err) {
        console.error('Anmeldefehler:', err);
        setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    // Zufällige Zahl zwischen 1 und 10 generieren (für die 10 Bilder im Ordner)
    const randomNum = Math.floor(Math.random() * 10) + 1;
    setRandomImageNumber(randomNum);
    console.log("Zufällige Bildnummer (Login):", randomNum);
  }, []);

  return (
		<div className="flex min-h-screen relative overflow-hidden">
			{/* Zufälliges Hintergrundbild */}
			<img 
				src={`/login-register/login-register-bg-${randomImageNumber}.jpg`}
				alt="Login Hintergrund"
				className="absolute inset-0 w-full h-full object-cover"
				style={{ zIndex: -2 }}
			/>
			
			{/* Dunkler Overlay für bessere Lesbarkeit */}
			<div className="absolute inset-0 bg-black opacity-70" style={{ zIndex: -1 }}></div>

			{/* Inhalt-Container */}
			<div className="flex w-full items-center justify-center z-10 px-8">
				{/* Logo-Bereich (links) */}
				<div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
					<img 
						src="/TheGND_Logo_light.png"
						alt="GND Logo"
						className="max-w-xs w-full"
					/>
				</div>

				{/* Anmeldeformular (rechts) */}
				<div className="w-full md:w-1/2 flex justify-center">
					<div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8 w-full max-w-md border border-white/20 bg-[hsl(240,10%,3.9%)]">
						<h1 className="text-2xl text-white font-bold mb-6 text-center">Anmelden</h1>
						
						<div className="mb-4">
							<p className="text-sm text-center mb-2 text-gray-300">
								Neuer Benutzer? <Link href="/auth/register" className="text-[hsl(345.3,82.7%,40.8%)] hover:underline">Konto anlegen</Link>
							</p>
						</div>

						<form className="space-y-4" onSubmit={handleSubmit}>
							{/* Schritt 1: E-Mail-Adresse */}
							{currentStep === 1 && (
								<>
									<div>
										<label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-Mail-Adresse</label>
										<input
											type="email"
											id="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[hsl(345.3,82.7%,40.8%)] focus:border-[hsl(345.3,82.7%,40.8%)] text-white bg-black/30"
											required
										/>
									</div>

									<button
										type="submit"
										className="w-full bg-[hsl(345.3,82.7%,40.8%)] text-white py-2 px-4 rounded-md hover:bg-[hsl(345.3,82.7%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] focus:ring-offset-2"
									>
										Weiter
									</button>
								</>
							)}
							
							{/* Schritt 2: Passwort */}
							{currentStep === 2 && (
								<>
									<div className="mb-2">
										<p className="text-sm text-gray-300">Anmelden als <span className="text-white font-medium">{email}</span></p>
										<button 
											type="button" 
											className="text-xs text-[hsl(345.3,82.7%,40.8%)] hover:underline"
											onClick={() => setCurrentStep(1)}
										>
											Ändern
										</button>
									</div>

									<div>
										<label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Passwort</label>
										<input
											type="password"
											id="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[hsl(345.3,82.7%,40.8%)] focus:border-[hsl(345.3,82.7%,40.8%)] text-white bg-black/30"
											required
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<input
												id="remember-me"
												name="remember-me"
												type="checkbox"
												className="h-4 w-4 text-[hsl(345.3,82.7%,40.8%)] focus:ring-[hsl(345.3,82.7%,40.8%)] border-gray-300 rounded"
											/>
											<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
												Angemeldet bleiben
											</label>
										</div>

										<div className="text-sm">
											<a href="#" className="text-[hsl(345.3,82.7%,40.8%)] hover:underline">
												Passwort vergessen?
											</a>
										</div>
									</div>

									<button
										type="submit"
										className="w-full bg-[hsl(345.3,82.7%,40.8%)] text-white py-2 px-4 rounded-md hover:bg-[hsl(345.3,82.7%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] focus:ring-offset-2 mt-4"
									>
										Anmelden
									</button>
								</>
							)}
						</form>

						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-3 py-1 bg-white/10 backdrop-blur-md bg-[hsl(240,10%,3.9%)] text-black rounded-md">Oder</span>
								</div>
							</div>

							<div className="mt-6 space-y-3">
								<button
									type="button"
									className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
								>
									<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
									Weiter mit Google
								</button>
							</div>
						</div>

						<div className="mt-6 text-center">
						</div>

						<div className="mt-4 text-center">
							<button
								type="button"
								className="text-sm text-[hsl(345.3,82.7%,40.8%)] hover:underline"
							>
								Hilfe bei der Anmeldung
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
