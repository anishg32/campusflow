const fs = require('fs');
const path = './src/app/dashboard/attendance/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = '<div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">\n            <table className="w-full text-sm">';

const replacementStr = `          {/* ===== MOBILE CARD VIEW ===== */}
          <div className="lg:hidden space-y-2.5">
            {faculties.map((fac, i) => {
              const status = attendance[fac._id];
              return (
                <motion.div
                  key={fac._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.25 }}
                  className={\`bg-card border rounded-2xl p-4 shadow-sm transition-colors \${
                    status === 'present' ? 'border-emerald-500/30 bg-emerald-500/5' : 
                    status === 'absent' ? 'border-red-500/30 bg-red-500/5' : 
                    'border-border'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-500/10 shrink-0">
                      {fac.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{fac.name}</p>
                      <p className="text-[11px] text-foreground/50 font-mono mt-0.5">{fac.loginId}</p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleAttendance(fac._id)}
                        className={\`p-2.5 rounded-xl transition-all \${
                          status === 'present'
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-foreground/5 border border-border text-foreground/40'
                        }\`}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => toggleAttendance(fac._id)}
                        className={\`p-2.5 rounded-xl transition-all \${
                          status === 'absent'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : 'bg-foreground/5 border border-border text-foreground/40'
                        }\`}
                      >
                        <XIcon size={16} />
                      </button>
                      {status === 'absent' && (
                        <button
                          onClick={() => sendWhatsAppMessage(fac, 'absent', selectedDate)}
                          className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 transition-colors"
                          title="WhatsApp Faculty"
                        >
                          <MessageCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ===== DESKTOP TABLE VIEW ===== */}
          <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(path, code);
