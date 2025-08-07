import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const host = document.getElementById('seo-checker-host');

const app = mount(App, {
  target: host.shadowRoot.getElementById('app'),
})

export default app
