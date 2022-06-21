import Wrapper from 'containers/wrapper';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="py-32 bg-white">
      <Wrapper>
        <nav>
          <ul className="flex flex-col">
            <li>
              <Link href="/about">
                <a className="font-black uppercase font-display text-9xl">About us</a>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <a className="font-black uppercase font-display text-9xl">Contact us</a>
              </Link>
            </li>
            <li>
              <a className="font-black uppercase font-display text-9xl">Blog</a>
            </li>
          </ul>
        </nav>
      </Wrapper>
    </footer>
  );
};

export default Footer;
