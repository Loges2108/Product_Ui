pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        UI_REPO = 'https://github.com/Loges2108/Product_Ui.git'
        EMAIL_TO = 'aws.saquib@gmail.com'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Determine Environment') {
            steps {
                script {
                    def jobName = env.JOB_NAME?.toUpperCase() ?: ''

                    if (jobName.endsWith('_DEV')) {
                        env.DEPLOY_ENV = 'DEV'
                        env.GIT_BRANCH = 'DEV'
                    } else if (jobName.endsWith('_SIT')) {
                        env.DEPLOY_ENV = 'SIT'
                        env.GIT_BRANCH = 'SIT'
                    } else if (jobName.endsWith('_UAT')) {
                        env.DEPLOY_ENV = 'UAT'
                        env.GIT_BRANCH = 'UAT'
                    } else {
                        error("Unsupported UI job: ${env.JOB_NAME}")
                    }

                    env.ENV_FILE = "/var/www/product-ui/.env.${env.DEPLOY_ENV.toLowerCase()}"
                    env.DEPLOY_DIR = "/var/www/product-ui/${env.DEPLOY_ENV.toLowerCase()}/dist"
                    env.API_BASE_URL = "http://prod-${env.DEPLOY_ENV.toLowerCase()}.work.gd/api"

                    echo "Deploy environment: ${env.DEPLOY_ENV}"
                    echo "Git branch: ${env.GIT_BRANCH}"
                    echo "Env file: ${env.ENV_FILE}"
                    echo "Deploy dir: ${env.DEPLOY_DIR}"
                }
            }
        }

        stage('Checkout') {
            steps {
                git branch: "${env.GIT_BRANCH}", url: "${env.UI_REPO}", poll: true, changelog: true
            }
        }

        stage('Identify Commit Author') {
            steps {
                sh '''
                    set +e
                    git log -1 --pretty=format:'%an <%ae>' || true
                '''
            }
        }

        stage('Validate Source') {
            steps {
                sh '''
                    set -eu
                    test -f package.json
                    test -f package-lock.json
                    test -f vite.config.js
                    test -f src/main.jsx
                    echo "UI source validation passed"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -eu
                    npm ci --no-audit --no-fund
                '''
            }
        }

        stage('Build and Publish Frontend') {
            steps {
                sh '''
                    set -eu
                    test -n "${ENV_FILE}"
                    test -f "${ENV_FILE}"

                    chmod +x ./deploy-product-ui 2>/dev/null || true
                    ./deploy-product-ui "${DEPLOY_ENV}" "${WORKSPACE}"
                '''
            }
        }

        stage('Verify Published Output') {
            steps {
                sh '''
                    set -eu
                    test -f "${DEPLOY_DIR}/index.html"
                    curl --fail --silent --show-error \
                      --retry 10 --retry-delay 3 \
                      "file://${DEPLOY_DIR}/index.html" >/dev/null
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                    set +e
                    rm -rf .cache .vite dist 2>/dev/null || true
                '''
            }
        }
    }

    post {
        success {
            script {
                try {
                    emailext(
                        to: "${env.EMAIL_TO}",
                        subject: "${env.JOB_NAME} build succeeded (${env.DEPLOY_ENV})",
                        body: "Frontend build and publish succeeded for ${env.JOB_NAME} on ${env.GIT_BRANCH}.\nCommit author: ${env.GIT_COMMIT?:'unknown'}"
                    )
                } catch (Exception err) {
                    echo "Email notification skipped: ${err.getMessage()}"
                }
            }
        }
        failure {
            script {
                try {
                    emailext(
                        to: "${env.EMAIL_TO}",
                        subject: "${env.JOB_NAME} build failed (${env.DEPLOY_ENV})",
                        body: "Frontend build failed for ${env.JOB_NAME} on ${env.GIT_BRANCH}.\nCheck Jenkins logs for details."
                    )
                } catch (Exception err) {
                    echo "Email notification skipped: ${err.getMessage()}"
                }
            }
        }
    }
}
