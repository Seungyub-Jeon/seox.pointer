import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const host = document.getElementById('seo-checker-host');

const app = mount(App, {
  target: host.shadowRoot.getElementById('app'),
  props: {
    hostElement: host
  }
})

export default app
