// Arabic Utilities & Tafqeet for Zajel Al Nokhba

export function formatCurrency(amount: number, currency = 'ر.س'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
  return `${formatted} ${currency}`;
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// Arabic Tafqeet (تحويل الأرقام إلى كلمات عربية فصحى معتمدة للسندات والفواتير)
export function tafqeetArabic(amount: number, currencyName = 'ريال سعودي', subunitName = 'هللة'): string {
  if (isNaN(amount) || amount === 0) return `صفر ${currencyName} فقط لا غير`;

  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
    'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  function convertGroup(n: number): string {
    let res = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;

    if (h > 0) {
      res += hundreds[h];
    }

    if (remainder > 0) {
      if (res) res += ' و ';
      if (remainder < 20) {
        res += ones[remainder];
      } else {
        const o = remainder % 10;
        const t = Math.floor(remainder / 10);
        if (o > 0) {
          res += `${ones[o]} و ${tens[t]}`;
        } else {
          res += tens[t];
        }
      }
    }
    return res;
  }

  const integerPart = Math.floor(Math.abs(amount));
  const fractionPart = Math.round((Math.abs(amount) - integerPart) * 100);

  let parts: string[] = [];

  const billions = Math.floor(integerPart / 1000000000);
  const millions = Math.floor((integerPart % 1000000000) / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  if (billions > 0) {
    if (billions === 1) parts.push('مليار');
    else if (billions === 2) parts.push('ملياران');
    else parts.push(`${convertGroup(billions)} مليار`);
  }

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(`${convertGroup(millions)} ملايين`);
    else parts.push(`${convertGroup(millions)} مليون`);
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(`${convertGroup(thousands)} آلاف`);
    else parts.push(`${convertGroup(thousands)} ألف`);
  }

  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  let result = 'فقط ' + (parts.join(' و ') || 'صفر') + ' ' + currencyName;

  if (fractionPart > 0) {
    result += ` و ${convertGroup(fractionPart)} ${subunitName}`;
  }

  result += ' لا غير';
  return result;
}
