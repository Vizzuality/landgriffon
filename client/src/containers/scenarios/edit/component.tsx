import Link from 'next/link';
import { Anchor } from 'components/button';

const Scenarios = () => (
  <>
    <h1>Edit scenario</h1>
    <Link href="/analysis" shallow>
      <Anchor>Cancel</Anchor>
    </Link>
  </>
);

export default Scenarios;
