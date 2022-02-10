const Step1 = () => (
    <>
  
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">New supplier</legend>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
  
          <label htmlFor="first_name" className="block font-medium text-gray-700">
            Tier 1 supplier <span className="text-gray-500">(optional)</span>
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
  
          <label htmlFor="first_name" className="block font-medium text-gray-700">
            Producer <span className="text-gray-500">(optional)</span>
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
        </div>
      </fieldset>
  
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">Supplier location</legend>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
  
          <label htmlFor="first_name" className="block font-medium text-gray-700">
            Location type
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
  
          <label htmlFor="first_name" className="block font-medium text-gray-700">
            Country
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
        </div>
        <label htmlFor="first_name" className="mt-4 block font-medium text-gray-700">
          City / Adress / Coordinates
          <div className="mt-1">
            <input
              type="text"
              name="first_name"
              id="first_name"
              autoComplete="given-name"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
            />
          </div>
        </label>
      </fieldset>
  
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5">Supplier impacts per tone</legend>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
  
          <label htmlFor="first_name" className="block font-medium text-gray-700">
            Carbon emissions
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
  
          <label htmlFor="first_name" className="block font-medium text-gray-700">
            Deforestation risk
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
  
          <label htmlFor="first_name" className="block font-medium text-gray-700">
            Deforestation risk
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
  
          <label htmlFor="first_name" className="block font-medium text-gray-700">
            Deforestation risk
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
              />
            </div>
          </label>
        </div>
      </fieldset>
  
    </>
  
  );
  
  export default Step1;
  