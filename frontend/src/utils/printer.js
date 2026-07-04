const SETTINGS_KEY = 'g8_printer_settings';

export const defaultPrinterSettings = {
  mode: 'browser',
  printerName: '',
  paperWidth: '80',
  autoOpenPrintDialog: true,
  usbVendorId: '',
  usbProductId: '',
};

export function decimalToHexId(value) {
  if (value === undefined || value === null || value === '') return '';
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return String(value).toLowerCase();
  return numericValue.toString(16).padStart(4, '0');
}

export function getPrinterSettings() {
  try {
    return {
      ...defaultPrinterSettings,
      ...(JSON.parse(window.localStorage.getItem(SETTINGS_KEY)) || {}),
    };
  } catch {
    return defaultPrinterSettings;
  }
}

export function savePrinterSettings(settings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    ...defaultPrinterSettings,
    ...settings,
  }));
}

export function openPrintWindow(title = 'receipt') {
  const printWindow = window.open('', '_blank', 'width=460,height=720');
  if (!printWindow) {
    throw new Error('Please allow pop-ups so the print window can open.');
  }
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #172326;
            background: #f7f4ee;
          }
        </style>
      </head>
      <body>
        <strong>Preparing print preview...</strong>
      </body>
    </html>
  `);
  printWindow.document.close();
  return printWindow;
}

export function printPdfBlob(blob, title = 'receipt', printWindow = null) {
  return new Promise((resolve, reject) => {
    const url = window.URL.createObjectURL(blob);

    if (printWindow && !printWindow.closed) {
      printWindow.location.replace(url);
      window.setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
          window.setTimeout(() => window.URL.revokeObjectURL(url), 120000);
          resolve();
        } catch (error) {
          window.URL.revokeObjectURL(url);
          reject(error);
        }
      }, 1200);
      return;
    }

    const frame = document.createElement('iframe');
    let cleanedUp = false;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      frame.remove();
      window.URL.revokeObjectURL(url);
    };

    frame.title = title;
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '1px';
    frame.style.height = '1px';
    frame.style.border = '0';
    frame.style.opacity = '0';
    frame.src = url;

    frame.onload = () => {
      setTimeout(() => {
        try {
          const printWindow = frame.contentWindow;
          if (!printWindow) {
            throw new Error('The print frame is not available.');
          }
          printWindow.focus();
          printWindow.onafterprint = cleanup;
          printWindow.print();
          window.setTimeout(cleanup, 120000);
          resolve();
        } catch (error) {
          cleanup();
          reject(error);
        }
      }, 800);
    };

    frame.onerror = () => {
      cleanup();
      reject(new Error('Could not load the PDF for printing.'));
    };

    document.body.appendChild(frame);
  });
}

export function printTestReceipt(settings = getPrinterSettings()) {
  const paperWidth = settings.paperWidth === '58' ? '58mm' : '80mm';
  const testWindow = window.open('', '_blank', 'width=420,height=680');
  if (!testWindow) {
    throw new Error('Please allow pop-ups to print a test receipt.');
  }

  testWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Printer test</title>
        <style>
          @page { size: ${paperWidth} auto; margin: 4mm; }
          * { box-sizing: border-box; }
          body {
            width: ${paperWidth};
            margin: 0;
            color: #111;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            font-size: 11px;
          }
          .receipt { width: 100%; }
          .center { text-align: center; }
          .bold { font-weight: 800; }
          .rule { border-top: 1px dashed #111; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; gap: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center bold">G8 YACHT VILLA</div>
          <div class="center">THERMAL PRINTER TEST</div>
          <div class="rule"></div>
          <div class="row"><span>Printer</span><span>${settings.printerName || 'Browser default'}</span></div>
          <div class="row"><span>Paper</span><span>${paperWidth}</span></div>
          <div class="row"><span>Status</span><span>Ready</span></div>
          <div class="rule"></div>
          <div>Use your browser print dialog to choose the Xprinter device, then save it as the default for this terminal if your browser offers that option.</div>
          <div class="rule"></div>
          <div class="center bold">Thank you.</div>
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 600);
          };
        </script>
      </body>
    </html>
  `);
  testWindow.document.close();
}

export async function connectUsbReceiptPrinter() {
  if (!navigator.usb) {
    throw new Error('USB printer connection requires a browser with WebUSB support, such as Chrome or Edge.');
  }

  const device = await navigator.usb.requestDevice({ filters: [] });
  return {
    productName: device.productName || 'USB receipt printer',
    manufacturerName: device.manufacturerName || '',
    vendorId: device.vendorId,
    productId: device.productId,
  };
}
