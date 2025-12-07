import React, { useState, useMemo, useEffect } from 'react';
        <main className="flex-1 flex overflow-x-auto overflow-y-hidden relative">
          {/* LIST */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth min-w-0 border-r border-white/5 pb-20">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredData.map(country => (
                <div key={country.id} onClick={() => setSelectedCountry(country)} className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedCountry?.id === country.id ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]' : 'bg-slate-900/40 border-white/5 hover:border-cyan-500/30'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div><h3 className={`text-base font-bold transition-colors ${selectedCountry?.id === country.id ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>{country.name}</h3><div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><MapPin size={12} className={selectedCountry?.id === country.id ? 'text-cyan-500' : ''} /> {country.region}</div></div>
                    <div className="flex gap-1 mt-1">{[1,2,3,4,5].map(bar => (<div key={bar} className={`w-1 h-3 rounded-full transition-all duration-500 ${(country.difficulty / 20) >= bar ? (country.difficulty > 70 ? 'bg-red-500' : country.difficulty > 40 ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-slate-800'}`}/>))}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950/50 border border-white/10 text-slate-300">{country.visa}</span>
                    {country.education.workRights.includes('Limitsiz') && (<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 size={10} /> Full-Work</span>)}
                  </div>
                  {userNotes[country.id] && (<div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse" />)}
                </div>
              ))}
            </div>
          </div>
          
          {/* MIDDLE - RESPONSIVE HIDDEN ON SMALL SCREENS */}
          {selectedCountry && (
             <div className="hidden 2xl:flex max-w-[300px] w-full flex-col p-4 bg-slate-900/30 backdrop-blur-sm border-l border-white/5 shrink-0 overflow-y-auto">
               <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2 uppercase tracking-wider sticky top-0 bg-slate-900/90 z-10 py-2 -mt-2"><Activity className="text-yellow-400" size={14} /> Taktiksel Destek</h3>
               <div className="mb-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Users size={10} /> Network</h4>
                 <div className="space-y-2">
                   <button onClick={() => performNetworkSearch('alumni', selectedCountry)} className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 p-2.5 rounded-xl flex items-center gap-3 transition-all group text-left">
                     <div className="p-1.5 bg-blue-900/30 text-blue-400 rounded-lg group-hover:text-white transition-colors"><Linkedin size={14}/></div>
                     <div><div className="text-xs font-bold text-slate-200 group-hover:text-white">Türk Mühendisleri</div><div className="text-[9px] text-slate-500">{selectedCountry.name}</div></div>
                   </button>
                   <button onClick={() => performNetworkSearch('recruiter', selectedCountry)} className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 p-2.5 rounded-xl flex items-center gap-3 transition-all group text-left">
                     <div className="p-1.5 bg-purple-900/30 text-purple-400 rounded-lg group-hover:text-white transition-colors"><Search size={14}/></div>
                     <div><div className="text-xs font-bold text-slate-200 group-hover:text-white">İşe Alımcılar</div><div className="text-[9px] text-slate-500">Recruiters</div></div>
                   </button>
                 </div>
               </div>
               <div>
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Lightbulb size={10} /> Projeler</h4>
                 <div className="bg-slate-950/50 rounded-xl border border-white/10 p-3">
                    <div className="text-[9px] text-cyan-500 font-bold mb-2 uppercase tracking-wide border-b border-white/5 pb-1 truncate">{selectedRole}</div>
                    <div className="space-y-3">
                      {(projectIdeas[selectedRole] || projectIdeas["Junior Embedded Software Engineer"]).map((idea, i) => (
                        <div key={i} className="flex gap-2 items-start">
                           <div className="mt-0.5 p-1 bg-yellow-500/10 rounded text-yellow-500 shrink-0"><Code size={10}/></div>
                           <div><div className="text-[11px] font-bold text-slate-200 leading-tight">{idea.title}</div><div className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{idea.desc}</div></div>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
             </div>
          )}

          {/* DETAIL - RESPONSIVE WIDTH */}
          {selectedCountry && (
            <div className="fixed inset-0 z-40 md:static md:z-auto w-full md:max-w-[380px] lg:max-w-[420px] xl:max-w-[450px]md:border-l md:border-white/10 bg-slate-900/95 backdrop-blur-xl flex flex-col transition-all duration-300 shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">

              <div className="relative h-48 shrink-0 overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedCountry.tier === 'Tier 1' ? 'from-emerald-900/40 via-slate-900 to-slate-900' : selectedCountry.tier === 'Tier 2' ? 'from-blue-900/40 via-slate-900 to-slate-900' : 'from-red-900/40 via-slate-900 to-slate-900'} z-0`}></div>
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                <button onClick={() => setSelectedCountry(null)} className="absolute top-6 left-6 z-20 md:hidden bg-black/50 p-2 rounded-full text-white backdrop-blur-md"><ArrowRight size={20} className="rotate-180" /></button>
                <div className="absolute bottom-6 left-8 z-20 right-8">
                  <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedCountry.tier === 'Tier 1' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : selectedCountry.tier === 'Tier 2' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{selectedCountry.tier}</div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">{selectedCountry.name}</h2>
                  <div className="flex p-1 bg-slate-950/50 backdrop-blur-md rounded-xl border border-white/10">
                    <button onClick={() => setViewMode('career')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${viewMode === 'career' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Briefcase size={12} /> Profesyonel</button>
                    <button onClick={() => setViewMode('education')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${viewMode === 'education' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><GraduationCap size={12} /> Akademik</button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50 pb-20 min-h-0">
                {viewMode === 'career' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><Coins size={32}/></div>
                        <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Yıllık Maaş</div><div className="text-base font-bold text-emerald-400">{selectedCountry.salary}</div>
                        <div className="w-full bg-slate-700/50 h-1 mt-2 rounded-full"><div className="bg-emerald-500 h-full rounded-full" style={{width: '70%'}}></div></div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 relative overflow-hidden">
