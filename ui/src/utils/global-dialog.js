import Vue from 'vue'

import { isSSR } from '../plugins/Platform.js'
import extend from '../utils/extend.js'

const ssrAPI = {
  onOk: () => ssrAPI,
  okCancel: () => ssrAPI,
  hide: () => ssrAPI,
  update: () => ssrAPI
}

export default function (DefaultComponent) {
  return ({ className, class: klass, style, component, root, parent, ...props }) => {
    if (isSSR === true) { return ssrAPI }

    klass !== void 0 && (props.cardClass = klass)
    style !== void 0 && (props.cardStyle = style)

    const
      okFns = [],
      cancelFns = [],
      API = {
        onOk (fn) {
          okFns.push(fn)
          return API
        },
        onCancel (fn) {
          cancelFns.push(fn)
          return API
        },
        onDismiss (fn) {
          okFns.push(fn)
          cancelFns.push(fn)
          return API
        },
        hide () {
          vm.$refs.dialog.hide()
          return API
        },
        update ({ className, class: klass, style, component, root, parent, ...cfg }) {
          if (vm !== null) {
            klass !== void 0 && (cfg.cardClass = klass)
            style !== void 0 && (cfg.cardStyle = style)

            extend(true, props, cfg)
            vm.$forceUpdate()
          }
          return API
        }
      }

    const node = document.createElement('div')
    document.body.appendChild(node)

    let emittedOK = false

    const on = {
      ok: data => {
        emittedOK = true
        okFns.forEach(fn => { fn(data) })
      },

      hide: () => {
        vm.$destroy()
        vm.$el.remove()
        vm = null

        if (emittedOK !== true) {
          cancelFns.forEach(fn => { fn() })
        }
      }
    }

    const DialogComponent = component !== void 0
      ? component
      : DefaultComponent

    const attrs = component === void 0
      ? props
      : void 0

    let vm = new Vue({
      name: 'QGlobalDialog',

      el: node,
      parent: parent === void 0 ? root : parent,

      render (h) {
        return h(DialogComponent, {
          ref: 'dialog',
          props,
          attrs,
          on
        })
      },

      mounted () {
        this.$refs.dialog.show()
      }
    })

    return API
  }
}
