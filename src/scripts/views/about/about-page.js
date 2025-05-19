export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1 tabindex="0">About Page</h1>
        <p>Story Apps</p>
        <p>Copyright 2025</p>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
