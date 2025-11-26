
import React, { useState } from 'react';
import { User, Bell, Shield, ExternalLink, Smartphone, CheckCircle2, AlertCircle, LogOut, Save, X, Camera, Upload } from 'lucide-react';

interface SettingsProps {
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [isTelegramConnected] = useState(false); // Mock state
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    displayName: 'CryptoDJ_99',
    bio: 'Web3 Music Enthusiast & NFT Collector',
    address: '0x1284...34A2'
  });
  
  // Form State
  const [formData, setFormData] = useState(profile);

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <h2 className="text-3xl font-display font-bold text-white">Settings</h2>

       {/* Profile Section */}
       <div className="glass-panel p-6 rounded-2xl transition-all duration-300">
          {isEditing ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center space-x-6 mb-2">
                   {/* Avatar Upload */}
                   <div className="relative group cursor-pointer">
                      <div className="p-[3px] rounded-full bg-gradient-to-tr from-violet-500 via-purple-500 to-indigo-500 shadow-lg shadow-violet-500/30">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.displayName}&backgroundColor=1e1b4b`}
                          alt="Avatar" 
                          className="w-24 h-24 rounded-full border-4 border-dark-900 bg-dark-800" 
                        />
                      </div>
                      
                      {/* Hover Overlay for Upload */}
                      <div className="absolute inset-[3px] rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border-4 border-transparent z-10">
                          <Camera size={20} className="text-white mb-1" />
                          <span className="text-[8px] uppercase font-bold text-white tracking-wider">Upload</span>
                      </div>
                      
                      {/* Hidden File Input covering the area */}
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                        accept="image/*"
                        title="Upload profile picture"
                      />
                   </div>

                   <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">Edit Profile</h3>
                      <p className="text-gray-400 text-xs mt-1 mb-3">Update your personal details.</p>
                      
                      <button className="relative overflow-hidden group bg-white/5 hover:bg-white/10 text-violet-300 text-xs font-medium px-4 py-2 rounded-lg border border-white/10 transition flex items-center space-x-2 w-fit">
                          <Upload size={14} />
                          <span>Upload New Picture</span>
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                          />
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block ml-1">Display Name</label>
                        <input 
                            type="text" 
                            value={formData.displayName}
                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none transition focus:ring-1 focus:ring-violet-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block ml-1">Bio</label>
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none transition resize-none h-24 focus:ring-1 focus:ring-violet-500/50"
                        />
                    </div>
                </div>

                <div className="flex space-x-3 pt-2">
                    <button onClick={handleSave} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-violet-600/20">
                        <Save size={18} />
                        <span>Save Changes</span>
                    </button>
                    <button onClick={handleCancel} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition flex items-center justify-center space-x-2 border border-white/5">
                        <X size={18} />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
                <div className="relative group cursor-pointer">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full opacity-30 blur-md group-hover:opacity-60 transition duration-500"></div>
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}&backgroundColor=1e1b4b`}
                        alt="Avatar" 
                        className="relative w-24 h-24 rounded-full border-4 border-dark-900 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 z-10" 
                    />
                    <button className="absolute bottom-0 right-0 z-20 bg-violet-600 text-white p-2 rounded-full border-4 border-dark-900 hover:bg-violet-500 transition shadow-md">
                        <User size={14} />
                    </button>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-0.5">{profile.displayName}</h3>
                    <p className="text-violet-400 text-sm mb-2 font-mono">{profile.address}</p>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm">{profile.bio}</p>
                    <button 
                        onClick={handleEdit} 
                        className="text-white text-xs mt-4 px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition font-medium flex items-center space-x-2"
                    >
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>
          )}
       </div>

       {/* Telegram Integration */}
       <div className="glass-panel p-6 rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden">
          <div className="absolute top-4 right-4">
             {isTelegramConnected ? (
               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                 <CheckCircle2 size={12} className="mr-1.5" />
                 Connected
               </span>
             ) : (
               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                 <AlertCircle size={12} className="mr-1.5" />
                 Not Connected
               </span>
             )}
          </div>
          
          <div className="flex items-start space-x-4 mb-4">
            <div className="p-3 bg-[#229ED9]/20 rounded-xl text-[#229ED9]">
               <Smartphone size={24} />
            </div>
            <div className="pr-20">
               <h3 className="text-lg font-bold text-white">Telegram Bot Integration</h3>
               <p className="text-blue-200/60 text-sm">@NormalDanceBot</p>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            Connect your account to receive real-time notifications about sales, mints, and trending tracks. 
            Also enables <span className="text-white font-medium">TON Wallet</span> features and Mini App access.
          </p>

          <a 
            href="https://t.me/NormalDanceBot?start=connect_dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#229ED9] hover:bg-[#1e8bc0] text-white rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 group"
          >
             <span>Launch Bot & Connect</span>
             <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
       </div>

       {/* Toggles */}
       <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Bell size={20} /></div>
                <div>
                   <p className="text-white font-medium">Push Notifications</p>
                   <p className="text-gray-500 text-xs">Get notified about new drops & sales</p>
                </div>
             </div>
             <div className="w-12 h-6 bg-violet-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
             </div>
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Shield size={20} /></div>
                <div>
                   <p className="text-white font-medium">Two-Factor Auth</p>
                   <p className="text-gray-500 text-xs">Extra security for your wallet</p>
                </div>
             </div>
             <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
             </div>
          </div>
       </div>

       {/* Logout */}
       <button 
         onClick={onLogout}
         className="w-full py-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition font-bold text-sm flex items-center justify-center space-x-2 group"
       >
         <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
         <span>Disconnect Wallet & Log Out</span>
       </button>
    </div>
  );
};
