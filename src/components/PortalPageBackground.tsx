/** Pola background halaman login — dipakai semua portal FTI. */
export function PortalPageBackground({ sakura = true }: { sakura?: boolean }) {
  return (
    <>
      <div
        className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v2c-9.941 0-18 8.059-18 18s8.059 18 18 18v2c-11.046 0-20-8.954-20-20zm-20 0c0-11.046 8.954-20 20-20v2C10.059 2 2 10.059 2 20s8.059 18 18 18v2c-11.046 0-20-8.954-20-20z' fill='%23FC809F' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#fff5f8]/80 via-transparent to-[#fce4ec]/30"
        aria-hidden
      />
      {sakura && (
        <>
          <div
            className="fixed top-8 right-[8%] z-0 opacity-[0.12] pointer-events-none lpk-sakura-float"
            aria-hidden
          >
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <path
                d="M60 8c4 18 14 28 32 32-18 4-28 14-32 32-4-18-14-28-32-32 18-4 28-14 32-32z"
                fill="#FC809F"
              />
            </svg>
          </div>
          <div
            className="fixed bottom-16 left-[6%] z-0 opacity-[0.08] pointer-events-none lpk-sakura-float-delayed"
            aria-hidden
          >
            <svg width="90" height="90" viewBox="0 0 120 120" fill="none">
              <path
                d="M60 8c4 18 14 28 32 32-18 4-28 14-32 32-4-18-14-28-32-32 18-4 28-14 32-32z"
                fill="#e06a88"
              />
            </svg>
          </div>
          <div className="fixed top-1/3 left-[4%] z-0 opacity-[0.06] pointer-events-none" aria-hidden>
            <span className="font-serif text-6xl text-primary-pink/40 select-none">桜</span>
          </div>
        </>
      )}
    </>
  );
}
