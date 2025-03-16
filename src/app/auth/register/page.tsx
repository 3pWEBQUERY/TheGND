'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const RegisterPage: React.FC = () => {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [accountType, setAccountType] = useState('member');
	const [profileImage, setProfileImage] = useState<File | null>(null);
	const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
	const [randomImageNumber, setRandomImageNumber] = useState<number>(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (currentStep === 5) {
			setIsSubmitting(true);
			setError(null);
			
			try {
				const formData = new FormData();
				formData.append('email', email);
				formData.append('username', username);
				formData.append('password', password);
				formData.append('accountType', accountType);
				
				if (profileImage) {
					formData.append('profileImage', profileImage);
				}
				
				const response = await fetch('/api/auth/register', {
					method: 'POST',
					body: formData
				});
				
				const data = await response.json();
				
				if (!response.ok) {
					throw new Error(data.error || 'Registrierung fehlgeschlagen');
				}
				
				// Weiterleitung zur Login-Seite nach erfolgreicher Registrierung
				router.push('/auth/login?registered=true');
			} catch (err) {
				console.error('Registrierungsfehler:', err);
				setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
			} finally {
				setIsSubmitting(false);
			}
		} else {
			handleNextStep();
		}
	};

	const handleNextStep = () => {
		setCurrentStep(prev => prev + 1);
	};
	
	const handlePreviousStep = () => {
		setCurrentStep(prev => Math.max(1, prev - 1));
	};
	
	const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setProfileImage(file);
			
			// Erstellen einer Vorschau des Bildes
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfileImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};
	
	
	useEffect(() => {
		// Zufällige Zahl zwischen 1 und 10 generieren (für die 10 Bilder im Ordner)
		const randomNum = Math.floor(Math.random() * 10) + 1;
		setRandomImageNumber(randomNum);
		console.log("Zufällige Bildnummer (Register):", randomNum);
	}, []);

	return (
		<div className="flex min-h-screen relative overflow-hidden">
			{/* Zufälliges Hintergrundbild */}
			<img 
				src={`/login-register/login-register-bg-${randomImageNumber}.jpg`}
				alt="Register Hintergrund"
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

				{/* Registrierungsformular (rechts) */}
				<div className="w-full md:w-1/2 flex justify-center">
					<div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8 w-full max-w-md border border-white/20 bg-[hsl(240,10%,3.9%)]">
						<h1 className="text-2xl font-bold mb-6 text-center text-white">Registrieren</h1>
						
						<div className="mb-4">
							<p className="text-sm text-center mb-2 text-gray-300">
								Bereits registriert? <Link href="/auth/login" className="text-[hsl(345.3,82.7%,40.8%)] hover:underline">Anmelden</Link>
							</p>
						</div>

						{/* Schrittanzeige */}
						<div className="mb-6">
							<div className="flex justify-between items-center">
								{[1, 2, 3, 4, 5].map((step) => (
									<div key={step} className="flex flex-col items-center">
										<div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-[hsl(345.3,82.7%,40.8%)] text-white' : 'bg-white/10 text-gray-300'}`}>
											{step}
										</div>
										<div className="text-xs mt-1 text-gray-300">
											{step === 1 && 'E-Mail'}
											{step === 2 && 'Benutzername'}
											{step === 3 && 'Passwort'}
											{step === 4 && 'Profilbild'}
											{step === 5 && 'Fertig'}
										</div>
									</div>
								))}
							</div>
							<div className="w-full bg-white/10 h-1 mt-4 rounded-full">
								<div 
									className="bg-[hsl(345.3,82.7%,40.8%)] h-1 rounded-full transition-all duration-300" 
									style={{ width: `${(currentStep / 5) * 100}%` }}
								></div>
							</div>
						</div>

						<form className="space-y-4" onSubmit={handleSubmit}>
							{/* Schritt 1: E-Mail und Kontotyp */}
							{currentStep === 1 && (
								<>
									<div className="mb-4">
										<label className="block text-sm font-medium text-gray-300 mb-1">Kontotyp</label>
										<Tabs defaultValue="member" value={accountType} onValueChange={setAccountType} className="w-full">
											<TabsList className="w-full bg-white/5 p-1">
												<TabsTrigger value="member" className="flex-1 text-white hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white data-[state=active]:bg-[hsl(345.3,82.7%,40.8%)] data-[state=active]:text-white">Mitglied</TabsTrigger>
												<TabsTrigger value="escort" className="flex-1 text-white hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white data-[state=active]:bg-[hsl(345.3,82.7%,40.8%)] data-[state=active]:text-white">Escort</TabsTrigger>
												<TabsTrigger value="agency" className="flex-1 text-white hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white data-[state=active]:bg-[hsl(345.3,82.7%,40.8%)] data-[state=active]:text-white">Agentur</TabsTrigger>
												<TabsTrigger value="club" className="flex-1 text-white hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white data-[state=active]:bg-[hsl(345.3,82.7%,40.8%)] data-[state=active]:text-white">Club</TabsTrigger>
												<TabsTrigger value="studio" className="flex-1 text-white hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white data-[state=active]:bg-[hsl(345.3,82.7%,40.8%)] data-[state=active]:text-white">Studio</TabsTrigger>
											</TabsList>
										</Tabs>
									</div>

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

									<div className="flex justify-end mt-6">
										<button
											type="button"
											className="bg-[hsl(345.3,82.7%,40.8%)] text-white py-2 px-6 rounded-md hover:bg-[hsl(345.3,82.7%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] focus:ring-offset-2"
											onClick={handleNextStep}
											disabled={!email}
										>
											Weiter
										</button>
									</div>
								</>
							)}

							{/* Schritt 2: Benutzername */}
							{currentStep === 2 && (
								<>
									<div>
										<label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Benutzername</label>
										<input
											type="text"
											id="username"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[hsl(345.3,82.7%,40.8%)] focus:border-[hsl(345.3,82.7%,40.8%)] text-white bg-black/30"
											required
										/>
									</div>

									<div className="flex justify-between mt-6">
										<button
											type="button"
											className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
											onClick={handlePreviousStep}
										>
											Zurück
										</button>
										<button
											type="button"
											className="bg-[hsl(345.3,82.7%,40.8%)] text-white py-2 px-6 rounded-md hover:bg-[hsl(345.3,82.7%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] focus:ring-offset-2"
											onClick={handleNextStep}
											disabled={!username}
										>
											Weiter
										</button>
									</div>
								</>
							)}

							{/* Schritt 3: Passwort */}
							{currentStep === 3 && (
								<>
									<div className="space-y-4">
										<div>
											<label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Passwort</label>
											<input
												type="password"
												id="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[hsl(345.3,82.7%,40.8%)] focus:border-[hsl(345.3,82.7%,40.8%)] text-white bg-black/30"
												required
												minLength={8}
											/>
										</div>

										<div>
											<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Passwort bestätigen</label>
											<input
												type="password"
												id="confirmPassword"
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[hsl(345.3,82.7%,40.8%)] focus:border-[hsl(345.3,82.7%,40.8%)] text-white bg-black/30"
												required
											/>
										</div>
										{password && confirmPassword && password !== confirmPassword && (
											<p className="text-red-500 text-sm">Die Passwörter stimmen nicht überein.</p>
										)}
									</div>

									<div className="flex justify-between mt-6">
										<button
											type="button"
											className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
											onClick={handlePreviousStep}
										>
											Zurück
										</button>
										<button
											type="button"
											className="bg-[hsl(345.3,82.7%,40.8%)] text-white py-2 px-6 rounded-md hover:bg-[hsl(345.3,82.7%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] focus:ring-offset-2"
											onClick={handleNextStep}
											disabled={!password || !confirmPassword || password !== confirmPassword}
										>
											Weiter
										</button>
									</div>
								</>
							)}

							{/* Schritt 4: Profilbild */}
							{currentStep === 4 && (
								<>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">Profilbild hochladen</label>
											<div className="flex items-center justify-center flex-col space-y-4">
												{profileImage ? (
													<div className="relative">
														<img
															src={URL.createObjectURL(profileImage)}
															alt="Profilbild Vorschau"
															className="w-32 h-32 rounded-full object-cover border-2 border-[hsl(345.3,82.7%,40.8%)]"
														/>
														<button
															type="button"
															className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
															onClick={() => setProfileImage(null)}
														>
															<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>
												) : (
													<div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-400">
														<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
														</svg>
													</div>
												)}

												<div>
													<label htmlFor="profileImageInput" className="cursor-pointer bg-[hsl(345.3,82.7%,40.8%)] text-white py-2 px-4 rounded-md hover:bg-[hsl(345.3,82.7%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] focus:ring-offset-2 inline-block">
														{profileImage ? 'Bild ändern' : 'Bild auswählen'}
													</label>
													<input
														id="profileImageInput"
														type="file"
														accept="image/*"
														className="hidden"
														onChange={(e) => {
															if (e.target.files && e.target.files[0]) {
																setProfileImage(e.target.files[0]);
															}
														}}
													/>
												</div>
											</div>
										</div>
									</div>

									<div className="flex justify-between mt-6">
										<button
											type="button"
											className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
											onClick={handlePreviousStep}
										>
											Zurück
										</button>
										<button
											type="button"
											className="bg-[hsl(345.3,82.7%,40.8%)] text-white py-2 px-6 rounded-md hover:bg-[hsl(345.3,82.7%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] focus:ring-offset-2"
											onClick={handleNextStep}
										>
											Weiter
										</button>
									</div>
								</>
							)}

							{/* Schritt 5: Zusammenfassung */}
							{currentStep === 5 && (
	<>
									<div className="space-y-4">
										<h3 className="text-lg font-medium text-white">Zusammenfassung Ihrer Angaben</h3>
										
										<div className="bg-white/10 p-4 rounded-md space-y-3">
											<div className="flex justify-between">
												<span className="text-gray-300">Kontotyp:</span>
												<span className="text-white font-medium">
													{accountType === 'member' && 'Mitglied'}
													{accountType === 'escort' && 'Escort'}
													{accountType === 'agency' && 'Agentur'}
													{accountType === 'club' && 'Club'}
													{accountType === 'studio' && 'Studio'}
												</span>
											</div>
											
											<div className="flex justify-between">
												<span className="text-gray-300">E-Mail:</span>
												<span className="text-white font-medium">{email}</span>
											</div>
											
											<div className="flex justify-between">
												<span className="text-gray-300">Benutzername:</span>
												<span className="text-white font-medium">{username}</span>
											</div>
											
											<div className="flex justify-between">
												<span className="text-gray-300">Passwort:</span>
												<span className="text-white font-medium">••••••••</span>
											</div>
											
											<div className="flex items-center justify-between">
												<span className="text-gray-300">Profilbild:</span>
												{profileImage ? (
													<img
														src={URL.createObjectURL(profileImage)}
														alt="Profilbild Vorschau"
														className="w-10 h-10 rounded-full object-cover border border-[hsl(345.3,82.7%,40.8%)]"
													/>
												) : (
													<span className="text-white font-medium">Kein Bild ausgewählt</span>
												)}
											</div>
										</div>
									</div>
								
									<div className="flex justify-between mt-6">
										<button
											type="button"
											className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
											onClick={handlePreviousStep}
										>
											Zurück
										</button>
										<button
											type="submit"
											className="bg-[hsl(345.3,82.7%,40.8%)] text-white py-2 px-6 rounded-md hover:bg-[hsl(345.3,82.7%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(345.3,82.7%,40.8%)] focus:ring-offset-2"
										>
											Konto erstellen
										</button>
									</div>
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
							<p className="text-xs text-gray-300">
								Indem Sie fortfahren, stimmen Sie unseren <a href="#" className="text-[hsl(345.3,82.7%,40.8%)] hover:underline">Nutzungsbedingungen</a> und <a href="#" className="text-[hsl(345.3,82.7%,40.8%)] hover:underline">Datenschutzrichtlinien</a> zu.
							</p>
						</div>

						<div className="mt-4 text-center">
							<button
								type="button"
								className="text-sm text-gray-300 hover:underline"
							>
								Hilfe bei der Registrierung
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
