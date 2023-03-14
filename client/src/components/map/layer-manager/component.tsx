const LayerManager = ({ layers }) => {
  const LAYERS_FILTERED = Object.keys(layers).filter((layerId) => !!layers[layerId]);

  return (
    <>
      {LAYERS_FILTERED.map((layerId, i) => {
        const LayerComponent = layers[layerId];
        // ? sets how the layers will be displayed on the map
        const beforeId = i === 0 ? 'custom-layers' : `${LAYERS_FILTERED[i - 1]}-layer`;

        return (
          <LayerComponent
            key={layerId}
            id={`${layerId}-layer`}
            beforeId={beforeId}
            zIndex={1000 - i}
          />
        );
      })}
    </>
  );
};

export default LayerManager;
