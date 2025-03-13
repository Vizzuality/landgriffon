from kedro.pipeline import node, Pipeline, pipeline  # noqa


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([node(lambda x: x, "input", "output")])
