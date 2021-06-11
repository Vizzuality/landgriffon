/* eslint-disable jsx-a11y/label-has-associated-control */
const ScenarioForm = () => (
  <form action="#" method="POST">
    <div className="col-span-6 sm:col-span-3">
      <input
        type="text"
        name="scenario_name"
        id="scenario_name"
        autoComplete="given-name"
        value="Scenario name 1"
        className="block w-full mt-1 border border-white rounded-md py-2 px-0 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg leading-6 font-medium"
      />
    </div>

    <div className="col-span-6 sm:col-span-4">
      <label htmlFor="email_address" className="block text-sm font-medium text-gray-700">
        Description (optional)
      </label>
      <textarea
        id="description"
        name="description"
        rows={3}
        className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
        defaultValue=""
      />
    </div>
  </form>
);

export default ScenarioForm;
