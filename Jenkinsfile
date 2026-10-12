
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
        EMAIL_TO = 'logeswaran2108@gmail.com'
        SHOULD_DEPLOY = 'false'
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
                        error(
                            "Unsupported UI job: ${env.JOB_NAME}. " +
                            "Use Product_UI_DEV, Product_UI_SIT, or Product_UI_UAT."
                        )
                    }

                    env.ENV_FILE =
                        "/var/www/product-ui/.env.${env.DEPLOY_ENV.toLowerCase()}"

                    env.DEPLOY_DIR =
                        "/var/www/product-ui/${env.DEPLOY_ENV.toLowerCase()}/dist"

                    echo "Environment: ${env.DEPLOY_ENV}"
                    echo "Branch: ${env.GIT_BRANCH}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Identify Commit') {
            steps {
                script {
                    env.COMMIT_SHA = sh(
                        script: 'git rev-parse HEAD',
                        returnStdout: true
                    ).trim()

                    env.COMMIT_AUTHOR = sh(
                        script: "git log -1 --pretty=format:'%an <%ae>'",
                        returnStdout: true
                    ).trim()

                    echo "Commit: ${env.COMMIT_SHA}"
                    echo "Author: ${env.COMMIT_AUTHOR}"
                }
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

        stage('Validate Promotion') {
            steps {
                script {
                    if (env.DEPLOY_ENV == 'DEV') {
                        env.SHOULD_DEPLOY = 'true'
                        echo "DEV change: deployment enabled."
                    } else {
                        def sourceBranch =
                            env.DEPLOY_ENV == 'SIT' ? 'DEV' : 'SIT'

                        def parentCount = sh(
                            script: "git rev-list --parents -n 1 HEAD | awk '{print NF-1}'",
                            returnStdout: true
                        ).trim().toInteger()

                        if (parentCount < 2) {
                            env.SHOULD_DEPLOY = 'false'
                            echo "SKIPPED: Not a merge commit."
                        } else {
                            sh """
                                set -eu
                                git fetch origin \
                                  +refs/heads/${sourceBranch}:refs/remotes/origin/${sourceBranch}
                            """

                            def sourceParent = sh(
                                script: 'git rev-parse HEAD^2',
                                returnStdout: true
                            ).trim()

                            def sourceIsValid = sh(
                                script: """
                                    git merge-base --is-ancestor \
                                      '${sourceParent}' \
                                      'refs/remotes/origin/${sourceBranch}'
                                """,
                                returnStatus: true
                            ) == 0

                            if (sourceIsValid) {
                                env.SHOULD_DEPLOY = 'true'
                                echo "Valid promotion merge from ${sourceBranch}."
                            } else {
                                env.SHOULD_DEPLOY = 'false'
                                echo "SKIPPED: Merge source is not in ${sourceBranch} history."
                            }
                        }
                    }
                }
            }
        }

        stage('Build and Publish UI') {
            when {
                expression { env.SHOULD_DEPLOY == 'true' }
            }
            steps {
                sh '''
                    set -eu
                    test -f "${ENV_FILE}"

                    sudo -n /usr/local/sbin/deploy-product-ui \
                        "${DEPLOY_ENV}" \
                        "${WORKSPACE}"
                '''
            }
        }

        stage('Verify Published Output') {
            when {
                expression { env.SHOULD_DEPLOY == 'true' }
            }
            steps {
                sh '''
                    set -eu
                    test -s "${DEPLOY_DIR}/index.html"
                    echo "Published frontend verified"
                '''
            }
        }

        stage('Deployment Skipped') {
            when {
                expression { env.SHOULD_DEPLOY != 'true' }
            }
            steps {
                echo "No UI deployment performed: promotion rule was not satisfied."
            }
        }
    }

    post {
        success {
            script {
                def outcome = env.SHOULD_DEPLOY == 'true'
                    ? 'Deployment succeeded'
                    : 'Build completed; deployment skipped'

                try {
                    emailext(
                        to: "${env.EMAIL_TO}",
                        subject: "${env.JOB_NAME}: ${outcome}",
                        body: """${outcome}

Job: ${env.JOB_NAME}
Environment: ${env.DEPLOY_ENV}
Branch: ${env.GIT_BRANCH}
Commit: ${env.COMMIT_SHA ?: 'unknown'}
Author: ${env.COMMIT_AUTHOR ?: 'unknown'}
Build: ${env.BUILD_URL}
"""
                    )
                } catch (Exception err) {
                    echo "Email notification failed: ${err.getMessage()}"
                }
            }
        }

        failure {
            script {
                try {
                    emailext(
                        to: "${env.EMAIL_TO}",
                        subject: "${env.JOB_NAME}: UI pipeline failed",
                        body: """UI pipeline failed.

Job: ${env.JOB_NAME}
Environment: ${env.DEPLOY_ENV ?: 'unknown'}
Branch: ${env.GIT_BRANCH ?: 'unknown'}
Build: ${env.BUILD_URL}

Check Jenkins Console Output for the error.
"""
                    )
                } catch (Exception err) {
                    echo "Email notification failed: ${err.getMessage()}"
                }
            }
        }
    }
}
