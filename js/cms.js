/*! CMS.js v2.0.0 | MIT (c) 2018 Chris Diana | https://github.com/chrisdiana/cms.js */
var CMS = function (o) {
  "use strict";
  var n, e;
  (this.ready = !1), (this.routes = {}), (this.collections = {});
  var i = {
      elementId: null,
      layoutDirectory: null,
      defaultView: null,
      errorLayout: null,
      mode: "SERVER",
      github: null,
      types: [],
      plugins: [],
      frontMatterSeperator: "---",
      listAttributes: ["tags"],
      dateParser: /\d{4}-\d{2}(?:-\d{2})?/,
      extension: ".md",
      sort: void 0,
      markdownEngine: null,
      debug: !(this.filteredCollections = {}),
      messageClassName: "cms-messages",
      onload: function () {},
      onroute: function () {},
    },
    r =
      'ERROR: No element ID or ID incorrect. Check "elementId" parameter in config.',
    s =
      "ERROR: Error getting files. Make sure there is a directory for each type in config with files in it.",
    l = "ERROR: Error getting the file",
    a =
      "ERROR: Error loading layout. Check the layout file to make sure it exists.",
    c = "WARNING: Not ready to perform action";
  function u() {
    (this.rules = [
      {
        regex: /(#+)(.*)/g,
        replacement: function (t, e, n) {
          var i = e.length;
          return "<h" + i + ">" + n.trim() + "</h" + i + ">";
        },
      },
      {
        regex: /!\[([^[]+)\]\(([^)]+)\)/g,
        replacement: "<img src='$2' alt='$1'>",
      },
      { regex: /\[([^[]+)\]\(([^)]+)\)/g, replacement: "<a href='$2'>$1</a>" },
      { regex: /(\*\*|__)(.*?)\1/g, replacement: "<strong>$2</strong>" },
      { regex: /(\*|_)(.*?)\1/g, replacement: "<em>$2</em>" },
      { regex: /~~(.*?)~~/g, replacement: "<del>$1</del>" },
      { regex: /:"(.*?)":/g, replacement: "<q>$1</q>" },
      {
        regex: /```[a-z]*\n[\s\S]*?\n```/g,
        replacement: function (t) {
          return "<pre>" + (t = t.replace(/```/gm, "")).trim() + "</pre>";
        },
      },
      {
        regex: /&&&[a-z]*\n[\s\S]*?\n&&&/g,
        replacement: function (t) {
          return (
            '<script type="text/javascript">' +
            (t = t.replace(/```/gm, "")).trim() +
            "</script>"
          );
        },
      },
      { regex: /`(.*?)`/g, replacement: "<code>$1</code>" },
      {
        regex: /\n\*(.*)/g,
        replacement: function (t, e) {
          return "\n<ul>\n\t<li>" + e.trim() + "</li>\n</ul>";
        },
      },
      {
        regex: /\n[0-9]+\.(.*)/g,
        replacement: function (t, e) {
          return "\n<ol>\n\t<li>" + e.trim() + "</li>\n</ol>";
        },
      },
      {
        regex: /\n(&gt;|>)(.*)/g,
        replacement: function (t, e, n) {
          return "\n<blockquote>" + n.trim() + "</blockquote>";
        },
      },
      { regex: /\n-{5,}/g, replacement: "\n<hr />" },
      {
        regex: /\n([^\n]+)\n/g,
        replacement: function (t, e) {
          var n = e.trim();
          if (/^<\/?(ul|ol|li|h|p|bl)/i.test(n)) return "\n" + e + "\n";
          return "\n<p>" + n + "</p>\n";
        },
      },
      { regex: /<\/ul>\s?<ul>/g, replacement: "" },
      { regex: /<\/ol>\s?<ol>/g, replacement: "" },
      { regex: /<\/blockquote><blockquote>/g, replacement: "\n" },
    ]),
      (this.render = function (e) {
        return (
          (e = "\n" + e + "\n"),
          this.rules.forEach(function (t) {
            e = e.replace(t.regex, t.replacement);
          }),
          e.trim()
        );
      });
  }
  function h(t, e) {
    var n = new XMLHttpRequest();
    n.open("GET", t, !0),
      (n.onreadystatechange = function () {
        4 === n.readyState &&
          (200 === n.status ? e(n.response, !1) : e(n, n.statusText));
      }),
      n.send();
  }
  function f(t, e) {
    e || (e = window.location.href), (t = t.replace(/[[]]/g, "\\$&"));
    var n = new RegExp("[?&]" + t + "(=([^&#]*)|&|#|$)").exec(e);
    return n
      ? n[2]
        ? decodeURIComponent(n[2].replace(/\+/g, " "))
        : ""
      : null;
  }
  function g(t, i, r) {
    h(t, function (t, e) {
      var n;
      e && r(t, e),
        r(
          ((n = t),
          new Function(
            "data",
            "var output=" +
              JSON.stringify(n)
                .replace(/<%=(.+?)%>/g, '"+($1)+"')
                .replace(/<%(.+?)%>/g, '";$1\noutput+="') +
              ";return output;"
          )(i)),
          e
        );
    });
  }
  function d(t, e) {
    (n.innerHTML = ""),
      g([o.layoutDirectory, "/", t, ".html"].join(""), e, function (t, e) {
        e ? m(a) : (n.innerHTML = t);
      });
  }
  function p(t) {
    var e = new Date(t);
    return (
      e.setDate(e.getDate() + 1),
      [e.getDate(), e.getMonth() + 1, e.getFullYear()].join("/")
    );
  }
  function m(t) {
    return o.debug && (e.innerHTML = t), t;
  }
  var y = function (t, e) {
    (this.type = t),
      (this.layout = e),
      (this.files = []),
      (this[t] = this.files);
  };
  y.prototype = {
    init: function (n) {
      this.getFiles(
        function (t, e) {
          e && m(s),
            this.loadFiles(
              function (t, e) {
                e && m(l), n();
              }.bind(this)
            );
        }.bind(this)
      );
    },
    getFileListUrl: function (t, e) {
      return "GITHUB" === e.mode
        ? ((n = t),
          (i = e.github),
          (r = [
            i.host,
            "repos",
            i.username,
            i.repo,
            "contents",
            n + "?ref=" + o.github.branch,
          ]),
          i.prefix && r.splice(5, 0, i.prefix),
          r.join("/"))
        : t;
      var n, i, r;
    },
    getFileUrl: function (t, e) {
      return "GITHUB" === e ? t.download_url : t.getAttribute("href");
    },
    getFileElements: function (t) {
      var e;
      if ("GITHUB" === o.mode) e = JSON.parse(t);
      else {
        var n = document.createElement("div");
        (n.innerHTML = t), (e = [].slice.call(n.getElementsByTagName("a")));
      }
      return e;
    },
    getFiles: function (n) {
      h(
        this.getFileListUrl(this.type, o),
        function (t, e) {
          e && n(t, e),
            this.getFileElements(t).forEach(
              function (t) {
                var e,
                  n,
                  i,
                  r = this.getFileUrl(t, o.mode);
                (e = r),
                  (n = o.extension),
                  ((i = e.split(".").pop()) === n.replace(".", "") ||
                    "html" === i) &&
                    this.files.push(new b(r, this.type, this.layout.single));
              }.bind(this)
            ),
            n(t, e);
        }.bind(this)
      );
    },
    loadFiles: function (r) {
      var s = [];
      this.files.forEach(
        function (n, i) {
          n.getContent(
            function (t, e) {
              e && r(t, e),
                s.push(i),
                n.parseContent(),
                this.files.length == s.length && r(t, e);
            }.bind(this)
          );
        }.bind(this)
      );
    },
    search: function (e, n) {
      this[this.type] = this.files.filter(function (t) {
        return 0 <= t[e].toLowerCase().trim().indexOf(n.toLowerCase().trim());
      });
    },
    resetSearch: function () {
      this[this.type] = this.files;
    },
    getByTag: function (e) {
      this[this.type] = this.files.filter(function (t) {
        if (e && t.tags)
          return t.tags.some(function (t) {
            return t === e;
          });
      });
    },
    getFileByPermalink: function (e) {
      return this.files.filter(function (t) {
        return t.permalink === e;
      })[0];
    },
    render: function () {
      return d(this.layout.list, this);
    },
  };
  var b = function (t, e, n) {
    (this.url = t),
      (this.type = e),
      (this.layout = n),
      (this.html = !1),
      this.content,
      this.name,
      this.extension,
      this.title,
      this.excerpt,
      this.date,
      this.datetime,
      this.author,
      this.body,
      this.permalink,
      this.tags;
  };
  (b.prototype = {
    getContent: function (n) {
      h(
        this.url,
        function (t, e) {
          e && n(t, e),
            (this.content = t),
            "string" == typeof this.content && n(t, e);
        }.bind(this)
      );
    },
    parseFrontMatter: function () {
      var t = this.content.split(o.frontMatterSeperator)[1];
      if (t) {
        var n = {};
        t.split(/\n/g).forEach(function (t) {
          var e = t.split(":");
          e[1] && (n[e[0].trim()] = e[1].trim());
        }),
          (function (t, e, n) {
            var i;
            for (i in (void 0 === e && (e = t), e))
              Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            n && n();
          })(this, n, null);
      }
    },
    setListAttributes: function () {
      o.listAttributes.forEach(
        function (t) {
          this.hasOwnProperty(t) &&
            this[t] &&
            (this[t] = this[t].split(",").map(function (t) {
              return t.trim();
            }));
        }.bind(this)
      );
    },
    setFilename: function () {
      this.name = this.url
        .substr(this.url.lastIndexOf("/"))
        .replace("/", "")
        .replace(o.extension, "");
    },
    setPermalink: function () {
      this.permalink = ["#", this.type, this.name].join("/");
    },
    setDate: function () {
      var t = new RegExp(o.dateParser);
      this.date
        ? ((this.datetime = new Date(this.date)), (this.date = p(this.date)))
        : t.test(this.url) &&
          ((this.date = t.exec(this.url)),
          (this.datetime = new Date(this.date)),
          (this.date = p(this.date)));
    },
    setBody: function () {
      var t = this.content
        .split(o.frontMatterSeperator)
        .splice(2)
        .join(o.frontMatterSeperator);
      if (this.html) this.body = t;
      else if (o.markdownEngine) this.body = o.markdownEngine(t);
      else {
        var e = new u();
        this.body = e.render(t);
      }
    },
    parseContent: function () {
      this.setFilename(),
        this.setPermalink(),
        this.parseFrontMatter(),
        this.setListAttributes(),
        this.setDate(),
        this.setBody();
    },
    render: function () {
      return d(this.layout, this);
    },
  }),
    (this.sort = function (t, e) {
      this.ready
        ? (this.collections[t][t].sort(e), this.collections[t].render())
        : m(c);
    }),
    (this.search = function (t, e, n) {
      this.ready
        ? (this.collections[t].search(e, n), this.collections[t].render())
        : m(c);
    }),
    (this.route = function () {
      var t = window.location.hash
          .split("/")
          .map(function (t) {
            return (
              0 <= t.indexOf("?") && (t = t.substring(0, t.indexOf("?"))), t
            );
          })
          .filter(function (t) {
            return "#" !== t;
          }),
        e = t[0],
        n = t[1],
        i = this.collections[e],
        r = f("query") || "",
        s = f("tag") || "";
      return (
        (this.routes[e] = function () {
          if (e)
            if (n) {
              var t = ["#", e, n.trim()].join("/");
              i.getFileByPermalink(t).render();
            } else
              i
                ? (r
                    ? i.search("title", r)
                    : s
                    ? i.getByTag(s)
                    : i.resetSearch(),
                  i.render())
                : d(o.errorLayout, {});
          else window.location = ["#", o.defaultView].join("/");
          o.onroute();
        }),
        this.routes[e]()
      );
    }),
    (this.registerPlugins = function () {
      o.plugins.forEach(
        function (t) {
          var e,
            n = (e = (e = (e = t.toString()).substr("function ".length)).substr(
              0,
              e.indexOf("(")
            ));
          this[n] || (this[n] = t);
        }.bind(this)
      );
    }),
    (this.initFileCollections = function (n) {
      var i = [],
        r = [];
      o.types.forEach(
        function (t) {
          (this.collections[t.name] = new y(t.name, t.layout)), r.push(t.name);
        }.bind(this)
      ),
        r.forEach(
          function (t, e) {
            this.collections[t].init(
              function () {
                i.push(e),
                  0 === t.indexOf("post") && this.collections[t][t].reverse(),
                  r.length == i.length && n();
              }.bind(this)
            );
          }.bind(this)
        );
    }),
    (this.init = function () {
      var t;
      (o = Object.assign({}, i, o)).debug &&
        ((t = o.messageClassName),
        ((e = document.createElement("div")).className = t),
        (e.innerHTML = "DEBUG"),
        (e.style.background = "yellow"),
        (e.style.position = "absolute"),
        (e.style.top = "0px"),
        document.body.appendChild(e)),
        window.addEventListener("hashchange", this.route.bind(this)),
        o.elementId && (n = document.getElementById(o.elementId))
          ? this.initFileCollections(
              function () {
                window.dispatchEvent(new HashChangeEvent("hashchange")),
                  (this.ready = !0),
                  this.registerPlugins(),
                  o.onload();
              }.bind(this)
            )
          : m(r);
    }),
    this.init();
};
