data "google_billing_account" "acct" {
  display_name = "My Billing Account"
  open         = true
}

resource "google_project" "tune_share_project" {
  name       = "tune-share"
  project_id = "tune-share"

  billing_account = data.google_billing_account.acct.id
}

resource "google_app_engine_application" "tune_share_app" {
  project     = google_project.tune_share_project.project_id
  location_id = "us-central"
  database_type = "CLOUD_FIRESTORE"
}
