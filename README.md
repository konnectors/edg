[Cozy][cozy] Konnector Eaux de Grenoble
=======================================

What's Cozy?
------------

![Cozy Logo](https://cdn.rawgit.com/cozy/cozy-guidelines/master/templates/cozy_logo_small.svg)

[Cozy] is a platform that brings all your web services in the same private space. With it, your webapps and your devices can share data easily, providing you with a new experience. You can install Cozy on your own hardware where no one's tracking you.

What's this new konnector?
--------------------------

The Cozy Konnector Eaux de Grenoble will automatically download all your bills as PDF documents from https://ael.eauxdegrenoblealpes.fr/.
All of your subscriptions bills will be grouped together into a folder path following this pattern:
```
<Contract type (e.g. EAU)>/<Street address>/<Filename with contract id>
```

It requires your login and password as defined when creating your online account on https://ael.eauxdegrenoblealpes.fr/ and a base folder.

### Open a Pull-Request

If you want to work on this konnector and submit code modifications, feel free to open pull-requests! See the [contributing guide][contribute] for more information about how to properly open pull-requests.

### Cozy-konnector-libs

This connector uses [cozy-konnector-libs](https://github.com/cozy/cozy-konnector-libs). You can find more documentation about it there.

### Maintainer

The lead maintainers for this konnector is @taratatach.


### Get in touch

You can reach the Cozy Community by:

- Chatting with us on IRC [#cozycloud on Libera.Chat][libera]
- Posting on our [Forum]
- Posting issues on the [Github repos][github]
- Say Hi! on [Twitter]


License
-------

Cozy Konnector Eaux de Grenoble is developed by Erwan Guyader (@taratatach) and distributed under the [AGPL v3 license][agpl-3.0].

[cozy]: https://cozy.io "Cozy Cloud"
[agpl-3.0]: https://www.gnu.org/licenses/agpl-3.0.html
[libera]: https://web.libera.chat/#cozycloud
[forum]: https://forum.cozy.io/
[github]: https://github.com/cozy/
[nodejs]: https://nodejs.org/
[standard]: https://standardjs.com
[twitter]: https://twitter.com/mycozycloud
[webpack]: https://webpack.js.org
[yarn]: https://yarnpkg.com
[travis]: https://travis-ci.org
[contribute]: CONTRIBUTING.md
