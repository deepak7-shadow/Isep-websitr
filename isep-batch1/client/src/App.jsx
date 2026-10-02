import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Certificates from './pages/Certificates';
import Achievements from './pages/Achievements';
import Thoughts from './pages/Thoughts';
import Admin from './pages/Admin';
import Activities from './pages/Activities';
import MockInterviews from './pages/MockInterviews';
import Hackathons from './pages/Hackathons';
import Memories from './pages/Memories';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div className="min-h-screen bg-[#131316] text-[#e4e1e5] flex flex-col justify-between selection:bg-[#f3be65]/30 selection:text-[#f3be65]">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="transition-all duration-300">
          {activeTab === 'home' && (
            <Home 
              setActiveTab={setActiveTab} 
              onOpenPhotoModal={setSelectedPhoto} 
            />
          )}
          {activeTab === 'gallery' && (
            <Gallery onOpenPhotoModal={setSelectedPhoto} />
          )}
          {activeTab === 'certificates' && (
            <Certificates onInspectCert={setSelectedCert} />
          )}
          {activeTab === 'achievements' && <Achievements />}
          {activeTab === 'hackathons' && <Hackathons />}
          {activeTab === 'mock-interviews' && <MockInterviews />}
          {activeTab === 'thoughts' && <Thoughts />}
          {activeTab === 'activities' && <Activities />}
          {activeTab === 'memories' && <Memories />}
          {activeTab === 'admin' && <Admin />}
        </main>
      </div>

      <Footer setActiveTab={setActiveTab} />

      {/* Photo Full-Screen View-Only Modal (No download button per Section 4.1 & 10) */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#1b1b1e] border border-[#f3be65]/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#131316]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
                  {selectedPhoto.album} • View-Only Record
                </span>
                <h3 className="font-serif text-lg font-bold text-[#e4e1e5]">{selectedPhoto.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full object-contain select-none pointer-events-auto"
              />
              {/* Subtle archival watermark overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <span className="font-cinzel text-3xl font-bold tracking-[0.3em] text-[#f3be65] rotate-[-25deg] select-none">
                  ISEP BATCH 1 ARCHIVE
                </span>
              </div>
            </div>

            <div className="p-5 bg-[#1b1b1e] border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#a3a1a8] max-w-xl leading-relaxed">
                {selectedPhoto.caption}
              </p>
              <div className="text-[10px] text-[#a3a1a8]/60 font-mono uppercase tracking-wider shrink-0">
                Direct Downloads Disabled
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate View-Only Preview Modal */}
      {selectedCert && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedCert(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-[#1b1b1e] border-2 border-[#f3be65]/40 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(243,190,101,0.15)] flex flex-col items-center text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Watermark diagonal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <span className="font-cinzel text-4xl sm:text-5xl font-bold tracking-[0.3em] text-[#f3be65] rotate-[-30deg] select-none">
                ISEP ARCHIVE VIEW-ONLY
              </span>
            </div>

            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="w-14 h-14 rounded-full border-2 border-[#f3be65] bg-[#131316] flex items-center justify-center mb-6 shadow-inner">
              <span className="font-cinzel text-base font-bold text-[#f3be65]">ISEP</span>
            </div>

            <span className="text-[11px] uppercase font-mono tracking-[0.25em] text-[#f3be65]">
              Official Credential Verification
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#e4e1e5] mt-2 mb-6">
              {selectedCert.title}
            </h2>

            <p className="text-xs text-[#a3a1a8] italic">This archival record certifies that</p>

            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#f3be65] my-4 border-b border-[#f3be65]/30 pb-2 px-8">
              {selectedCert.recipientName}
            </div>

            <p className="text-xs text-[#a3a1a8] max-w-md leading-relaxed">
              Has rigorously completed all requirements and technical defenses of the <strong className="text-[#e4e1e5]">ISEP Internship Program (Batch 1)</strong> with distinction.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-[#a3a1a8] gap-4">
              <div>
                <span className="text-[10px] uppercase text-[#a3a1a8]/60 block">Date of Issue</span>
                <span className="font-mono text-[#e4e1e5]">
                  {new Date(selectedCert.issueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase tracking-wider">
                Permanent Public Ledger • View Only
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


