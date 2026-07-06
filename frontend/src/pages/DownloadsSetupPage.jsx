import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Database, Download, FileJson, HardDrive, Laptop, Loader2, Server, Upload } from 'lucide-react';

const windowsOfflineBundleUrl = import.meta.env.VITE_WINDOWS_OFFLINE_BUNDLE_URL || '/downloads/G8-Yacht-Villa-Offline-Windows.zip';
const windowsAppDownloadUrl = import.meta.env.VITE_WINDOWS_APP_DOWNLOAD_URL || '/downloads/G8-Yacht-Villa-Operations-Setup.exe';
const dumpStorageKey = 'g8-startup-data-dump';

const osOptions = [
  { value: 'windows', label: 'Windows', available: true, detail: 'Includes backend, database setup, and the desktop app.' },
  { value: 'macos', label: 'macOS', available: false, detail: 'Coming later.' },
  { value: 'linux', label: 'Linux', available: false, detail: 'Coming later.' },
];

const downloadOptions = [
  {
    label: 'Offline Windows Bundle',
    description: 'Recommended. Includes the backend service, local database stack, Keycloak login service, and Windows desktop app.',
    url: windowsOfflineBundleUrl,
    icon: HardDrive,
    primary: true,
  },
  {
    label: 'Desktop App Only',
    description: 'Use only when the backend is already running on a server or another local machine.',
    url: windowsAppDownloadUrl,
    icon: Download,
    primary: false,
  },
];

const sampleDump = {
  rooms: [
    { number: 'Executive Room', capacity: 2 },
    { number: 'Single Garden Room', capacity: 1 },
  ],
  products: [],
  customers: [],
};

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function summarizeDump(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];

  return Object.entries(value)
    .filter(([, item]) => Array.isArray(item))
    .map(([key, item]) => ({ key, count: item.length }));
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function DownloadsSetupPage() {
  const fileInputRef = useRef(null);
  const [selectedOs, setSelectedOs] = useState('windows');
  const [dumpText, setDumpText] = useState('');
  const [dumpError, setDumpError] = useState('');
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    const savedDump = window.localStorage.getItem(dumpStorageKey);
    setDumpText(savedDump || formatJson(sampleDump));
  }, []);

  const selectedOption = osOptions.find((option) => option.value === selectedOs) || osOptions[0];
  const parsedDump = useMemo(() => {
    if (!dumpText.trim()) return null;
    try {
      return JSON.parse(dumpText);
    } catch {
      return null;
    }
  }, [dumpText]);
  const dumpSummary = summarizeDump(parsedDump);
  const dumpIsValid = Boolean(parsedDump) && !Array.isArray(parsedDump);

  const validateDump = () => {
    if (!dumpText.trim()) {
      setDumpError('Paste a JSON data dump before saving.');
      return false;
    }

    try {
      const parsed = JSON.parse(dumpText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setDumpError('The data dump should be a JSON object.');
        return false;
      }
      setDumpError('');
      return true;
    } catch (err) {
      setDumpError(err.message || 'The data dump is not valid JSON.');
      return false;
    }
  };

  const saveDump = () => {
    if (!validateDump()) return;
    window.localStorage.setItem(dumpStorageKey, dumpText);
    toast.success('Startup data dump saved on this device');
  };

  const useSampleDump = () => {
    const nextDump = formatJson(sampleDump);
    setDumpText(nextDump);
    setDumpError('');
    toast.success('Sample startup dump loaded');
  };

  const exportDump = () => {
    if (!validateDump()) return;
    downloadText('g8-startup-data-dump.json', dumpText);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setFileLoading(true);
      const content = await file.text();
      JSON.parse(content);
      setDumpText(content);
      setDumpError('');
      toast.success(`${file.name} loaded`);
    } catch (err) {
      setDumpError(err.message || 'Could not read that JSON file.');
      toast.error('Could not load data dump');
    } finally {
      setFileLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-app-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-app-text">Downloads</h2>
              <p className="text-sm text-app-muted">Download the desktop app and prepare startup data for a new installation.</p>
            </div>
          </div>
          <div className="rounded-md bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-700">
            Offline-ready backend included for Windows
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <div className="flex items-center gap-3">
            <Laptop className="h-5 w-5 text-brand-500" />
            <h3 className="text-xl font-black text-app-text">Choose OS</h3>
          </div>
          <div className="mt-5 grid gap-3">
            {osOptions.map((option) => {
              const active = selectedOs === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedOs(option.value)}
                  className={`rounded-lg border p-4 text-left transition ${
                    active ? 'border-brand-500 bg-brand-500/10' : 'border-app-border bg-app-elevated hover:border-brand-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-app-text">{option.label}</p>
                    {active ? <CheckCircle2 className="h-5 w-5 text-brand-500" /> : null}
                  </div>
                  <p className="mt-1 text-sm text-app-muted">{option.detail}</p>
                </button>
              );
            })}
          </div>
          <p className="mt-4 rounded-md bg-app-elevated p-3 text-xs font-bold leading-5 text-app-muted">
            Windows is selected by default. Set <span className="font-black text-app-text">VITE_WINDOWS_OFFLINE_BUNDLE_URL</span> when you publish the full offline installer bundle.
          </p>
        </div>

        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-brand-500" />
            <div>
              <h3 className="text-xl font-black text-app-text">Windows Download</h3>
              <p className="text-sm text-app-muted">Choose the full offline bundle when there may be no internet.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {downloadOptions.map((option) => {
              const Icon = option.icon;
              return (
                <a
                  key={option.label}
                  href={selectedOption.available ? option.url : undefined}
                  aria-disabled={!selectedOption.available}
                  className={`rounded-lg border p-4 transition ${
                    option.primary
                      ? 'border-brand-500 bg-brand-500/10 hover:bg-brand-500/15'
                      : 'border-app-border bg-app-elevated hover:border-brand-500/50'
                  } ${selectedOption.available ? 'block' : 'pointer-events-none opacity-60'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${option.primary ? 'bg-brand-600 text-white' : 'bg-app-card text-brand-500'}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-black text-app-text">{option.label}</p>
                        <p className="mt-1 text-sm leading-6 text-app-muted">{option.description}</p>
                      </div>
                    </div>
                    <Download className="mt-1 h-5 w-5 shrink-0 text-brand-500" />
                  </div>
                </a>
              );
            })}
          </div>
          <div className="mt-4 rounded-md bg-app-elevated p-3 text-xs font-bold leading-5 text-app-muted">
            The offline bundle should include Docker Desktop or a bundled runtime requirement, backend images/files, database startup scripts, migrations, and the Windows app configured to use the local backend.
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-brand-500" />
              <div>
                <h3 className="text-xl font-black text-app-text">Startup Data Dump</h3>
                <p className="text-sm text-app-muted">Paste or upload JSON for the first setup.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-app-border px-3 text-sm font-bold text-app-text hover:bg-app-elevated">
                {fileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload JSON
              </button>
              <button type="button" onClick={useSampleDump} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-app-border px-3 text-sm font-bold text-app-text hover:bg-app-elevated">
                <FileJson className="h-4 w-4" />
                Sample
              </button>
            </div>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Data dump JSON</span>
            <textarea
              value={dumpText}
              onChange={(event) => {
                setDumpText(event.target.value);
                setDumpError('');
              }}
              rows={14}
              spellCheck={false}
              className="w-full resize-y rounded-md border border-app-border bg-app-elevated px-3 py-3 font-mono text-sm text-app-text outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            />
          </label>

          {dumpError ? (
            <p className="mt-3 rounded-md bg-red-500/10 p-3 text-sm font-bold text-red-600">{dumpError}</p>
          ) : null}

          {dumpIsValid ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {dumpSummary.length ? dumpSummary.map((item) => (
                <div key={item.key} className="rounded-md bg-app-elevated p-3">
                  <p className="text-xs font-black uppercase text-app-muted">{item.key}</p>
                  <p className="mt-1 text-2xl font-black text-app-text">{item.count}</p>
                </div>
              )) : (
                <div className="rounded-md bg-app-elevated p-3 sm:col-span-3">
                  <p className="text-sm font-bold text-app-muted">Valid JSON object. Add arrays such as rooms, products, or customers to see counts here.</p>
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={exportDump} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-app-border px-4 text-sm font-bold text-app-text hover:bg-app-elevated">
              <Download className="h-4 w-4" />
              Download JSON
            </button>
            <button type="button" onClick={saveDump} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700">
              <CheckCircle2 className="h-4 w-4" />
              Save Draft
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
