'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Camera,
    X,
    CheckCircle2,
    RefreshCcw,
    Zap,
    Info,
    Ruler,
    AlertTriangle,
    ScanLine
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/utils'

// Mock Data pour les résultats
const MOCK_SCAN_RESULTS = {
    confidence: 0.94,
    measurements: {
        height: 175,
        chest: 98,
        waist: 82,
        hips: 95,
        shoulders: 45,
        arm_length: 62,
        inseam: 81
    },
    bodyType: 'V-Shape (Athlétique)'
}

export default function MeasurePage() {
    const router = useRouter()
    const [step, setStep] = useState<'intro' | 'camera' | 'processing' | 'results'>('intro')
    const [permission, setPermission] = useState<boolean | null>(null)
    const [progress, setProgress] = useState(0)

    // Simulation de la caméra
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (step === 'processing') {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval)
                        setStep('results')
                        return 100
                    }
                    return prev + 2
                })
            }, 50)
        }
        return () => clearInterval(interval)
    }, [step])

    const startCamera = () => {
        setPermission(true) // Mock permission
        setStep('camera')
        // Simuler le délai d'allumage
        setTimeout(() => {
            // En vrai: navigator.mediaDevices.getUserMedia...
        }, 1000)
    }

    const takePhoto = () => {
        setStep('processing')
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">

            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-black to-black opacity-50 pointer-events-none" />

            {/* HEADER SIMPLE */}
            <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none">
                <button onClick={() => router.back()} className="pointer-events-auto bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-white/10 transition">
                    <X className="w-6 h-6 text-white" />
                </button>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Signare Vision™</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-white/50">Système prêt</span>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* ÉTAPE 1: INTRO */}
                {step === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
                    >
                        <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center mb-8 relative">
                            <ScanLine className="w-10 h-10 text-[#D4AF37] animate-pulse" />
                            <div className="absolute inset-0 border border-[#D4AF37]/30 rounded-full animate-ping [animation-duration:3s]" />
                        </div>

                        <h1 className="text-3xl font-serif text-white font-bold mb-4">
                            Scanner votre silhouette
                        </h1>
                        <p className="text-white/60 mb-8 leading-relaxed">
                            Notre IA analyse votre morphologie via la caméra pour créer votre
                            <span className="text-[#D4AF37]"> Profil Mesure</span> de haute précision.
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full mb-8">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                                    <Zap className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-white">Rapide</span>
                                <span className="text-[10px] text-white/40 mt-1">~15 secondes</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-white">Précis</span>
                                <span className="text-[10px] text-white/40 mt-1">Marge ±0.5cm</span>
                            </div>
                        </div>

                        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-4 rounded-lg flex gap-3 text-left w-full mb-8">
                            <Info className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-[#D4AF37]/90 leading-relaxed">
                                Portez des vêtements près du corps pour une meilleure précision. Assurez-vous d'être dans un endroit bien éclairé.
                            </p>
                        </div>

                        <button
                            onClick={startCamera}
                            className="w-full bg-[#D4AF37] text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                        >
                            Commencer le scan
                        </button>
                    </motion.div>
                )}

                {/* ÉTAPE 2: CAMERA / SCAN */}
                {step === 'camera' && (
                    <motion.div
                        key="camera"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-screen relative bg-black"
                    >
                        {/* Fake Camera Feed */}
                        <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" // Placeholder photo silhouette
                                alt="Camera Feed"
                                fill
                                className="object-cover opacity-60"
                            />

                            {/* Overlay Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                            {/* Silhouette Guide */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                                <svg viewBox="0 0 200 400" className="h-[80%] w-auto stroke-white stroke-2 fill-none">
                                    {/* Abstract Body Shape Outline */}
                                    <path d="M100 20 C 130 20, 140 50, 140 80 C 140 100, 160 110, 170 150 L 170 250 L 160 380 L 140 380 L 140 250 L 130 250 L 130 380 L 110 380 L 110 250 C 110 220, 90 220, 90 250 L 90 380 L 70 380 L 70 250 L 60 250 L 60 380 L 40 380 L 30 250 L 30 150 C 40 110, 60 100, 60 80 C 60 50, 70 20, 100 20 Z" />
                                </svg>
                            </div>

                            {/* Scanning Bar Animation */}
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                className="absolute left-0 w-full h-1 bg-[#D4AF37] shadow-[0_0_20px_#D4AF37] z-10"
                            />
                        </div>

                        <div className="absolute bottom-10 left-0 w-full flex flex-col items-center z-20">
                            <p className="text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur text-sm mb-6 border border-white/10">
                                Placez-vous dans le cadre entier
                            </p>
                            <div className="flex items-center gap-8">
                                <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-md">
                                    <RefreshCcw className="w-6 h-6 text-white" />
                                </button>
                                <button onClick={takePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group overflow-hidden">
                                    <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform duration-200" />
                                </button>
                                <div className="w-14" /> {/* Spacer for centering */}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ÉTAPE 3: PROCESSING */}
                {step === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-screen flex flex-col items-center justify-center bg-black p-6 text-center"
                    >
                        <div className="relative w-32 h-32 mb-8">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                                <motion.circle
                                    cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent"
                                    className="text-[#D4AF37]"
                                    strokeDasharray={377}
                                    strokeDashoffset={377 - (377 * progress) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-white">
                                {progress}%
                            </div>
                        </div>

                        <h2 className="text-2xl font-serif text-white mb-2">Analyse IA en cours...</h2>

                        <div className="h-8 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={progress < 30 ? 1 : progress < 60 ? 2 : 3}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="text-white/50 text-sm absolute w-full left-0 right-0"
                                >
                                    {progress < 30 ? "Détection des points clés..." :
                                        progress < 60 ? "Reconstruction 3D de la posture..." :
                                            "Calcul des segments corporels..."}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* ÉTAPE 4: RÉSULTATS */}
                {step === 'results' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-screen overflow-y-auto bg-black pb-20 pt-16 px-6"
                    >
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                <CheckCircle2 size={14} /> Scan Terminé
                            </div>
                            <h2 className="text-3xl font-serif text-white">{MOCK_SCAN_RESULTS.confidence * 100}% de Confiance</h2>
                        </div>

                        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden mb-6">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Ruler className="text-[#D4AF37] w-4 h-4" /> Vos Mesures
                                </h3>
                                <span className="text-[10px] text-white/40 uppercase">Estimées</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {[
                                    { l: 'Tour de Poitrine', v: MOCK_SCAN_RESULTS.measurements.chest },
                                    { l: 'Tour de Taille', v: MOCK_SCAN_RESULTS.measurements.waist },
                                    { l: 'Tour de Hanches', v: MOCK_SCAN_RESULTS.measurements.hips },
                                    { l: 'Carrure Épaules', v: MOCK_SCAN_RESULTS.measurements.shoulders },
                                    { l: 'Longueur Bras', v: MOCK_SCAN_RESULTS.measurements.arm_length },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 flex justify-between items-center hover:bg-white/5 transition">
                                        <span className="text-sm text-white/70">{item.l}</span>
                                        <span className="font-serif font-bold text-white text-lg">{item.v} <span className="text-xs text-[#D4AF37]">cm</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#D4AF37] text-black rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 mb-2">Morphologie Détectée</p>
                                <h3 className="text-2xl font-black font-serif mb-1">{MOCK_SCAN_RESULTS.bodyType}</h3>
                                <p className="text-sm opacity-80 max-w-xs mx-auto">Idéal pour les coupes "Slim Fit" et les boubous structurés.</p>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
                            >
                                Enregistrer ce profil
                            </button>
                            <button
                                onClick={() => setStep('camera')}
                                className="w-full bg-transparent border border-white/20 text-white font-medium py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={16} /> Recommencer
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
