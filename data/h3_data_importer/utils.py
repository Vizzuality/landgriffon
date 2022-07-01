from re import sub


def slugify(s):
    s = sub(r"[_-]+", " ", s).title().replace(" ", "")
    return "".join([s[0].lower(), s[1:]])


def snakify(s):
    return sub(r"(?<!^)(?=[A-Z])", "_", s).lower()
