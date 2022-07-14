import { AnchorLink, Button } from 'components/button';
import Link from 'next/link';

const ScenarioCard: React.FC = () => (
  <div className="rounded-md bg-white p-6 space-y-6">
    <h2>Scenario name</h2>
    <p className="text-gray-500 text-xs leading-5">
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Possimus ut odit rerum quaerat
      minima repellendus veritatis voluptatibus vero inventore error corrupti natus, vel sunt
      perspiciatis nam voluptatum nulla. Corporis, debitis.
    </p>
    <div>
      <h3>Growth rates</h3>
      <div className="flex space-x-4 mt-2">
        <div className="rounded-full bg-blue py-0.5 px-3 text-xs">Entire company +1.5%/yr</div>
      </div>
    </div>
    <div>
      <h3>Interventions</h3>
      <div className="flex space-x-4 mt-2">
        <div className="rounded-full bg-yellow py-0.5 px-3 text-xs">A name of intervention</div>
      </div>
    </div>
    <div className="flex space-between">
      <Button theme="secondary">Delete</Button>
      <div className="flex flex-1 justify-end gap-2">
        <div className="text-xs text-right">
          Modified:
          <br /> 2022/07/12
        </div>
        <Link href={`/admin/scenarios/1/edit`} passHref>
          <AnchorLink theme="secondary">Edit</AnchorLink>
        </Link>
        <Button theme="primary">Analyze</Button>
      </div>
    </div>
  </div>
);

export default ScenarioCard;
