import { useEffect, useState } from 'react';
import { Cable, CheckCircle2, Clipboard, Info, Loader2, Printer, Save, Terminal, Usb, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import {
  connectUsbReceiptPrinter,
  decimalToHexId,
  defaultPrinterSettings,
  getPrinterSettings,
  printTestReceipt,
  savePrinterSettings,
} from '../utils/printer';

const connectionModes = [
  {
    value: 'browser',
    label: 'Browser print',
    description: 'Best for Xprinter devices installed through Windows, macOS, Linux, or Android printer settings.',
  },
  {
    value: 'usb',
    label: 'Direct USB',
    description: 'Experimental WebUSB connection for supported ESC/POS printers in Chrome or Edge.',
  },
];

export default function PrinterSettingsPage() {
  const [settings, setSettings] = useState(defaultPrinterSettings);
  const [usbDevice, setUsbDevice] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getPrinterSettings());
  }, []);

  const updateSetting = (field, value) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const save = () => {
    savePrinterSettings(settings);
    setSaved(true);
    toast.success('Printer settings saved for this terminal');
  };

  const runTestPrint = () => {
    try {
      savePrinterSettings(settings);
      printTestReceipt(settings);
      toast.success('Test receipt sent to the browser print dialog');
    } catch (err) {
      toast.error(err.message || 'Could not open the test receipt');
    }
  };

  const connectUsb = async () => {
    try {
      setConnecting(true);
      const device = await connectUsbReceiptPrinter();
      setUsbDevice(device);
      const label = [device.manufacturerName, device.productName].filter(Boolean).join(' ') || 'USB receipt printer';
      const next = {
        ...settings,
        mode: 'usb',
        printerName: label,
        usbVendorId: device.vendorId,
        usbProductId: device.productId,
      };
      setSettings(next);
      savePrinterSettings(next);
      setSaved(true);
      toast.success('USB printer remembered on this terminal');
    } catch (err) {
      toast.error(err.message || 'Could not connect to the USB printer');
    } finally {
      setConnecting(false);
    }
  };

  const browserSupportsUsb = Boolean(navigator.usb);
  const vendorId = decimalToHexId(settings.usbVendorId || usbDevice?.vendorId);
  const productId = decimalToHexId(settings.usbProductId || usbDevice?.productId);
  const hasUsbIds = Boolean(vendorId && productId);
  const udevRule = hasUsbIds
    ? `ATTRS{idVendor}=="${vendorId}", ATTRS{idProduct}=="${productId}", TAG+="uaccess"`
    : 'ATTRS{idVendor}=="2d37", ATTRS{idProduct}=="fe9e", TAG+="uaccess"';

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-app-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">Terminal settings</p>
            <h2 className="mt-2 text-2xl font-black text-app-text sm:text-3xl">Receipt printer</h2>
            <p className="mt-2 text-sm leading-6 text-app-muted">
              Connect the Xprinter thermal printer used at this cashier or frontdesk computer. These settings are saved in this browser, so each terminal can choose its own receipt printer.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runTestPrint}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-app-border px-4 text-sm font-black text-app-text transition hover:bg-app-elevated"
            >
              <Printer className="h-4 w-4" />
              Test print
            </button>
            <button
              type="button"
              onClick={save}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700"
            >
              {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save settings
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-lg border border-app-border bg-app-card p-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-app-text">
            <Cable className="h-5 w-5 text-brand-500" />
            Connection
          </h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {connectionModes.map((mode) => {
              const active = settings.mode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => updateSetting('mode', mode.value)}
                  className={`min-h-32 rounded-lg border p-4 text-left transition ${
                    active
                      ? 'border-brand-500 bg-brand-500/10 text-app-text'
                      : 'border-app-border bg-app-elevated text-app-muted hover:text-app-text'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-black text-app-text">
                    {mode.value === 'usb' ? <Usb className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
                    {mode.label}
                  </span>
                  <span className="mt-3 block text-sm leading-6">{mode.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-app-muted">Printer name</span>
              <input
                value={settings.printerName}
                onChange={(event) => updateSetting('printerName', event.target.value)}
                placeholder="Example: XP-80C Kitchen"
                className="mt-2 min-h-11 w-full rounded-md border border-app-border bg-app-elevated px-3 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-app-muted">Paper width</span>
              <select
                value={settings.paperWidth}
                onChange={(event) => updateSetting('paperWidth', event.target.value)}
                className="mt-2 min-h-11 w-full rounded-md border border-app-border bg-app-elevated px-3 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="80">80 mm receipt roll</option>
                <option value="58">58 mm receipt roll</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-app-muted">USB vendor ID</span>
              <input
                value={settings.usbVendorId || ''}
                onChange={(event) => updateSetting('usbVendorId', event.target.value.trim().toLowerCase())}
                placeholder="0483"
                className="mt-2 min-h-11 w-full rounded-md border border-app-border bg-app-elevated px-3 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-app-muted">USB product ID</span>
              <input
                value={settings.usbProductId || ''}
                onChange={(event) => updateSetting('usbProductId', event.target.value.trim().toLowerCase())}
                placeholder="5743"
                className="mt-2 min-h-11 w-full rounded-md border border-app-border bg-app-elevated px-3 text-sm font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
          </div>

          <label className="mt-5 flex items-center gap-3 rounded-lg border border-app-border bg-app-elevated p-4">
            <input
              type="checkbox"
              checked={settings.autoOpenPrintDialog}
              onChange={(event) => updateSetting('autoOpenPrintDialog', event.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            <span>
              <span className="block text-sm font-black text-app-text">Open print dialog when staff presses Print</span>
              <span className="mt-1 block text-sm text-app-muted">Invoices and receipts will open the system print dialog for the selected printer.</span>
            </span>
          </label>
        </section>

        <section className="rounded-lg border border-app-border bg-app-card p-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-app-text">
            <Usb className="h-5 w-5 text-brand-500" />
            Xprinter USB
          </h3>

          <div className="mt-5 rounded-lg border border-app-border bg-app-elevated p-4">
            <div className="flex items-start gap-3">
              {browserSupportsUsb ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-black text-app-text">
                  {browserSupportsUsb ? 'WebUSB is available' : 'WebUSB is not available'}
                </p>
                <p className="mt-1 text-sm leading-6 text-app-muted">
                  Direct USB printing depends on the printer firmware, driver mode, and browser support. Browser print remains the recommended production setup.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={connectUsb}
            disabled={!browserSupportsUsb || connecting}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Usb className="h-4 w-4" />}
            Connect USB printer
          </button>

          {(usbDevice || settings.usbVendorId) && (
            <div className="mt-5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              <p className="font-black">{settings.printerName || usbDevice?.productName || 'USB receipt printer'}</p>
              <p className="mt-1">Vendor {vendorId || settings.usbVendorId || usbDevice?.vendorId} · Product {productId || settings.usbProductId || usbDevice?.productId}</p>
            </div>
          )}

          <div className="mt-5 flex gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-800 dark:text-amber-200">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              If the printer is connected by USB, first install it on the operating system as the default receipt printer. Then use Browser print and select the Xprinter device in the print dialog.
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-app-border bg-app-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-black text-app-text">
              <Terminal className="h-5 w-5 text-brand-500" />
              Linux USB access
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-app-muted">
              On Linux, Chrome or Edge can only open a USB thermal printer if the logged-in user has permission for that USB device. Use these steps on the cashier/frontdesk computer that the Xprinter is plugged into.
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyText(udevRule, 'udev rule copied')}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-app-border px-4 text-sm font-black text-app-text transition hover:bg-app-elevated"
          >
            <Clipboard className="h-4 w-4" />
            Copy rule
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {[
              ['Install USB tools', 'sudo apt-get install libudev-dev libusb-1.0-0-dev'],
              ['Find the printer IDs', 'lsusb'],
              ['Inspect the device path', hasUsbIds ? `lsusb -d ${vendorId}:${productId}` : 'lsusb -d 2d37:fe9e'],
              ['Reload udev rules', 'sudo udevadm control --reload-rules'],
            ].map(([label, command]) => (
              <div key={label} className="rounded-lg border border-app-border bg-app-elevated p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-app-muted">{label}</p>
                <code className="mt-2 block overflow-x-auto rounded-md bg-app-card px-3 py-2 text-xs font-bold text-app-text">{command}</code>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-app-border bg-app-elevated p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-app-muted">udev rule</p>
            <p className="mt-2 text-sm leading-6 text-app-muted">
              Create a file like <code>/etc/udev/rules.d/50-xprinter.rules</code> and add this line. Use the IDs from <code>lsusb</code> if they differ from the detected values.
            </p>
            <code className="mt-3 block overflow-x-auto rounded-md bg-app-card px-3 py-3 text-xs font-bold text-app-text">{udevRule}</code>
            <div className="mt-4 rounded-md border border-amber-500/25 bg-amber-500/10 p-3 text-sm leading-6 text-amber-800 dark:text-amber-200">
              After reloading rules, unplug and reconnect the printer. The device permissions should show a trailing plus sign, similar to <code>crw-rw-r--+</code>, when checked under <code>/dev/bus/usb/...</code>.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
