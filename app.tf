variable "project_id" {
  type    = string
  default = "tune-share"
}

data "google_billing_account" "acct" {
  display_name = "My Billing Account"
  open         = true
}

resource "google_project" "tune_share_project" {
  name       = "tune-share"
  project_id = var.project_id

  billing_account = data.google_billing_account.acct.id
}

resource "google_app_engine_application" "tune_share_app" {
  project       = var.project_id
  location_id   = "us-central"
  database_type = "CLOUD_FIRESTORE"
}

resource "google_service_account" "deployment_sa" {
  project    = var.project_id
  account_id = "deployment-sa"
}

# This list of roles comes from
# https://github.com/google-github-actions/deploy-appengine#via-google-github-actionsauth
resource "google_project_iam_member" "deployment_roles" {
  for_each = toset([
    "roles/appengine.appAdmin",
    "roles/iam.serviceAccountUser",
    "roles/storage.admin",
    "roles/cloudbuild.builds.editor",
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.deployment_sa.email}"
}

module "gh_oidc" {
  source      = "terraform-google-modules/github-actions-runners/google//modules/gh-oidc"
  project_id  = var.project_id
  pool_id     = "deployment-pool"
  provider_id = "deployment-provider"
  sa_mapping  = {
    (google_service_account.deployment_sa.account_id) = {
      sa_name   = google_service_account.deployment_sa.name
      attribute = "attribute.repository/gjohnston9/tune-share"
    }
  }
}
