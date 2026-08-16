const ENAMAD_URL = "https://trustseal.enamad.ir/?id=774806&Code=3KBPAZZpPuIcNtTCD9Xb0TRzzSoTlHEB";
const ENAMAD_LOGO = "https://trustseal.enamad.ir/logo.aspx?id=774806&Code=3KBPAZZpPuIcNtTCD9Xb0TRzzSoTlHEB";

export default function EnamadSeal() {
  return <aside className="enamad-seal" aria-label="نماد اعتماد الکترونیکی سبزینو">
    <a
      referrerPolicy="origin"
      target="_blank"
      rel="noopener noreferrer"
      href={ENAMAD_URL}
      aria-label="مشاهده اعتبار نماد اعتماد الکترونیکی سبزینو"
    >
      <img
        referrerPolicy="origin"
        src={ENAMAD_LOGO}
        alt="نماد اعتماد الکترونیکی سبزینو"
        width="110"
        height="120"
        loading="lazy"
        data-code="3KBPAZZpPuIcNtTCD9Xb0TRzzSoTlHEB"
      />
    </a>
    <span>نماد اعتماد الکترونیکی</span>
  </aside>;
}
