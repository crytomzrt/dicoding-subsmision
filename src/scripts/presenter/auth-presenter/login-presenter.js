import AuthModel from "../../models/auth-model";

export default class LoginPagePresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    try {
      this.view.addSubmitListener(this.handleLoginSubmit.bind(this));
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }

  async handleLoginSubmit(event) {
    event.preventDefault();
    const formData = this.view.getFormData();
    const { email, password } = formData;

    // Reset error message
    this.view.hideErrorMessage();

    try {
      // Show loading state
      this.view.setLoadingState(true);

      // Attempt login using AuthModel
      await AuthModel.login(email, password);

      // Redirect to homepage on successful login
      window.location.hash = "#/";

    } catch (error) {
      // Show error message on failure
      this.view.setErrorMessage(error.message);
    } finally {
      // Reset loading state
      this.view.setLoadingState(false);
    }
  }
}
