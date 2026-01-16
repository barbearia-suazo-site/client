import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header
      style={{
        background: '#000',
        color: '#fff',
        padding: 16,
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* 👇 Logo clicável leva à página inicial */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/logo.png" // coloque sua logo dentro da pasta /public
            alt="Suazo Barber Logo"
            width={48}
            height={48}
            style={{ borderRadius: '50%', marginRight: 8 }}
          />
          <h2 style={{ margin: 0, color: '#2b72b5' }}></h2>
        </Link>

        {/* Menu */}
        <nav>
          <Link href="/servicos" style={{ color: '#fff', marginRight: 12, textDecoration: 'none' }}>
            Servicios
          </Link>
          <Link href="/produtos" style={{ color: '#fff', marginRight: 12, textDecoration: 'none' }}>
            Productos
          </Link>
          <Link href="/agendar" style={{ color: '#fff', marginRight: 12, textDecoration: 'none' }}>
            Reservar
          </Link>
          <Link href="/admin" style={{ color: '#fff', textDecoration: 'none' }}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
