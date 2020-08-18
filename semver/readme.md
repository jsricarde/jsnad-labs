## Semver

Semantic Versioning, otherwise known as `semver` has become a part of Node.js softwate development. Thanks to `npm` semver is embedded in the weay we publish and link packages together to form simple libraries or complex applications. The relationship Node.js has with semver is evolving over time, just as the semver specification itself is evolving.

We'll be exploring semver in a series of articles starting with this primer. It's important that we, as the Node.js community, understand semver since it plays such a significant role in defining the way we build software.

### What Is Semver?
Semver is a specification outlining a method of encoding the nature of change between releases of a "public interface", directly into the version string.

### Semver Construction
A semver-compatibile version is built from three numbers separated by periods `(.)`. The three numbers are referred to as `major`, `minor` and `patch`, and specified in that order. The combination of numbers represent an ordered version, where each of the three numbers are also ordered. A `major` version has a series of ordered `minor` versions, and a `minor` version has a series of ordered `patch` versions.

So:

- Version `0.3.10` is ordered before `0.10.3`
- Version `0.1.1` is ordered before `1.0.0`
- Version `1.100.100` is ordered before `10.10.10`

The semantic distinction between major, minor and patch is described succinctly at semver.org as:

- **MAJOR** version when you make incompatible API changes,
- **MINOR** version when you add functionality in a backwards-compatible manner, and
- **PATCH** version when you make backwards-compatible bug fixes.

### Semver Ranges

The concept of semver ranges as used by npm was inspired by Bundler, the npm of the Ruby ecosystem. For a Ruby application, semver ranges have a greater impact than they do in Node.js.

Semver ranges exist to permit newer versions of a package to be automatically installed automatically. This is particularly useful when you're dealing with deeply nested dependencies. Important bug fixes can be distributed to dependants, and dependants of dependants simply by signalling via the semver range. More about this later.

The simplest semver range is the `"*"` range which accepts any version available, defaulting to the "latest". `"*"` should be avoided as it will happily install packages with across major versions i.e. with breaking changes.

The next form of a semver range specifies a single `major` version, or a `major` and `minor` version. `"2"` covers all `minor` and `patch` versions less than `3` and `"2.4"` covers all `patch` versions less than 2.5. These ranges can also be achieved more explicitly with an `"x"` or an `"*"` in variable `patch` and `minor` positions. For example: `"2.x.x"` or `"2.4.*"`.

Additionally, ranges can be specified explicitly with `-`, `<`, `<=`, `>` and `>=`. For example:

- `"1.2.3 - 2.3.4"` is the same as `">=1.2.3 <=2.3.4"` which specifies that the range can include all versions from, and including `1.2.3` all the way up to, and including `2.3.4`.

- `">=1.2.0 <1.3.0"` is be similar to `"1.2.x"` (but not exactly the same, thanks to pre-release and metadata labels which are beyond the scope of this article).

- `"<1.0.0"` only accepts versions in the `"0.x.x"` range.

### Tilde & Caret Shorthand

Node.js' implementation of semver also introduces shorthand ranges: `~` (tilde) and `^` (caret). The general explanation for how these work is:

- Prefixing a single semver version string with the `~` character defines a range of acceptable versions that include all patch versions from the one specified up to, but not including, the next minor version. `"~1.2.3"` can be approximately expanded as `">=1.2.3 <1.3.0"`.

- Prefixing a single semver version string with the `^` character defines a range of acceptable versions that include all patch and minor versions from the ones specified up to, but not including, the next version. So `"^1.2.3"` can be approximately expanded as `">=1.2.3 <2.0.0"`.

### 0.x.x Versions

Complications arise with the use of `0.x.x` versions, where the rules get messy due to the nature of the special `0` major version number in the semver specification. The major version `0` is supposed to be reserved for "initial development", where "anything may change at any time", so the "patch" and "minor, non-breaking changes" essentially have no meaning.

Unlike `~,` the `^` operator with a major version of `0` is essentially a no-op, in that it translates to exactly that version rather than a full range. So `"^0.2.3"` is equal to just `"0.2.3"` and no more.

There was some discussion of changing the semantics of the `~` operator for `0.x.x` versions but it's too late to make that change now.