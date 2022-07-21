import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification.service";
// import { Verification } from "@bitwarden/common/src/types/verification";

@Component({
  selector: "app-delete-account",
  templateUrl: "delete-account.component.html",
})
export class DeleteAccountComponent {
  // showPassword: boolean;
  // masterPassword: Verification;

  deleteForm = this.formBuilder.group({
    secret: [""],
  });

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private userVerificationService: UserVerificationService,
    private messagingService: MessagingService,
    private logService: LogService,
    private formBuilder: FormBuilder
  ) {}

  // togglePassword() {
  //   this.showPassword = !this.showPassword;
  // }

  async submit() {
    try {
      const secret = this.deleteForm.get("secret").value;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const verificationRequest = await this.userVerificationService.buildRequest(secret);
      // await this.apiService.deleteAccount(verificationRequest);
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("accountDeleted"),
        this.i18nService.t("accountDeletedDesc")
      );
      // this.messagingService.send("logout");
    } catch (e) {
      this.logService.error(e);
    }
  }
}
