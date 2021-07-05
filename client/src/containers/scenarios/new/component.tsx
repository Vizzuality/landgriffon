import ScenarioForm from 'containers/scenarios/form';
import Interventions from 'containers/interventions';

const Scenarios = () => (
  <>
    <div>
      <ScenarioForm />
    </div>
    <div className="mt-10">
      <Interventions />
    </div>
  </>
);

export default Scenarios;
