'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

const ForgotPasswordPage: React.FC = () => {
	const [currentStep, setCurrentStep] = useState(1);
	const [email, setEmail] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [randomImageNumber, setRandomImageNumber] = useState<number>(1);
	
	const handleNextStep = () => {
		setCurrentStep(prev => prev + 1);
	};
	
	const handlePreviousStep = () => {
		setCurrentStep(prev => Math.max(1, prev - 1));
	};
	
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (currentStep < 3) {
			handleNextStep();
		} else {
			// Hier würde die tatsächliche Passwort-Reset-Logik implementiert werden
			console.log('Passwort zurückgesetzt', {
				email,
				verificationCode,
				newPassword
			});
			// Hier API-Aufruf oder andere Logik einfügen
			
			// Optional: Weiterleitung nach erfolgreicher Passwort-Änderung
			// window.location.href = '/auth/login';
		}
	};

	useEffect(() => {
		// Zufällige Zahl zwischen 1 und 10 generieren (für die 10 Bilder im Ordner)
		const randomNum = Math.floor(Math.random() * 10) + 1;
		setRandomImageNumber(randomNum);
		console.log("Zufällige Bildnummer (Passwort vergessen):", randomNum);
	}, []);

	return (
		<div className="flex min-h-screen relative overflow-hidden">
			{/* Zufälliges Hintergrundbild */}
			<img 
				src={`/login-register/login-register-bg-${randomImageNumber}.jpg`}
				alt="Passwort vergessen Hintergrund"
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

				{/* Passwort vergessen Formular (rechts) */}
				<div className="w-full md:w-1/2 flex justify-center">
					<div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8 w-full max-w-md border border-white/20 bg-[hsl(240,10%,3.9%)]">
						<h1 className="text-2xl text-white font-bold mb-6 text-center">
							{currentStep === 1 && "Passwort zurücksetzen"}
							{currentStep === 2 && "Bestätigungscode eingeben"}
							{currentStep === 3 && "Neues Passwort erstellen"}
						</h1>
						
						<div className="mb-4">
							<p className="text-sm text-center mb-2 text-gray-300">
								<Link href="/auth/login" className="text-[hsl(345.3,82.7%,40.8%)] hover:underline">Zurück zur Anmeldung</Link>
							</p>
						</div>

						{/* Fortschrittsanzeige */}
						<div className="mb-6">
							<div className="flex justify-between mb-2">
								<span className="text-xs text-gray-300">Schritt {currentStep} von 3</span>
							</div>
							<div className="w-full bg-gray-700 rounded-full h-2">
								<div 
									className="bg-[hsl(345.3,82.7%,40.8%)] h-2 rounded-full transition-all duration-300 ease-in-out" 
									style={{ width: `${(currentStep / 3) * 100}%` }}
								></div>
							</div>
						</div>

						<form className="space-y-4" onSubmit={handleSubmit}>
							{/* Schritt 1: E-Mail-Adresse */}
							{currentStep === 1 && (
								<>
									<div>
										<p className="text-sm text-gray-300 mb-4">
											Geben Sie Ihre E-Mail-Adresse ein, und wir senden Ihnen einen Code zum Zurücksetzen Ihres Passworts.
										</p>
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
										Code senden
									</button>
								</>
							)}
							
							{/* Schritt 2: Bestätigungscode */}
							{currentStep === 2 && (
								<>
									<div className="mb-2">
										<p className="text-sm text-gray-300">Code gesendet an <span className="text-white font-medium">{email}</span></p>
										<button 
											type="button" 
											className="text-xs text-[hsl(345.3,82.7%,40.8%)] hover:underline"
											onClick={() => setCurrentStep(1)}
										>
											Ändern
										</button>
									</div>

									<div>
										<p className="text-sm text-gray-300 mb-4">
											Geben Sie den 6-stelligen Code ein, den wir an Ihre E-Mail-Adresse gesendet haben.
										</p>
										<label htmlFor="verificationCode" className="block text-sm font-medium text-gray-300 mb-1">Bestätigungscode</label>
										<input
											type="text"
											id="verificationCode"
											value={verificationCode}
											onChange={(e) => setVerificationCode(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[hsl(345.3,82.7%,40.8%)] focus:border-[hsl(345.3,82.7%,40.8%)] text-white bg-black/30"
											required
											maxLength={6}
											minLength={6}
											pattern="[0-9]{6}"
										/>
										<p className="text-xs text-gray-400 mt-1">Der Code ist 10 Minuten gültig.</p>
									</div>

									<div className="flex justify-between">
										<button
											type="button"
											className="text-sm text-[hsl(345.3,82.7%,40.8%)] hover:underline"
											onClick={() => {
											// Code erneut senden Logik
											console.log('Code erneut senden an:', email);
											// Hier würde die tatsächliche Logik zum erneuten Senden des Codes implementiert werden
										}}
										>
											Code erneut senden
										</button>
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
											Weiter
										</button>
									</div>
								</>
							)}
							
							{/* Schritt 3: Neues Passwort */}
							{currentStep === 3 && (
								<>
									<div>
										<p className="text-sm text-gray-300 mb-4">
											Erstellen Sie ein neues, sicheres Passwort für Ihr Konto.
										</p>
										<div className="space-y-4">
											<div>
												<label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">Neues Passwort</label>
												<input
													type="password"
													id="newPassword"
													value={newPassword}
													onChange={(e) => setNewPassword(e.target.value)}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[hsl(345.3,82.7%,40.8%)] focus:border-[hsl(345.3,82.7%,40.8%)] text-white bg-black/30"
													required
													minLength={8}
												/>
												<p className="text-xs text-gray-400 mt-1">Mindestens 8 Zeichen</p>
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
											Passwort zurücksetzen
										</button>
									</div>
								</>
							)}
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
