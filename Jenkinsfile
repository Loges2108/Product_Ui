
pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    environment {
        SHOULD_DEPLOY = 'false'
        DEPLOY_ENV = ''
        EXPECTED_BRANCH = ''
        SOURCE_BRANCH = ''
        DEPLOY_DIR = ''
        COMMIT_SHA = ''
    }

    stages {

        // --------------------------------------------------
        // 1. Determine environment from Jenkins job name
        // --------------------------------------------------
        stage('Determine Environment') {
            steps {
                script {
                    def jobName = env.JOB_NAME.toUpperCase()

                    if (jobName.endsWith('_DEV')) {
                        env.DEPLOY_ENV = 'DEV'
                        env.EXPECTED_BRANCH = 'DEV'
                        env.DEPLOY_DIR = '/var/www/product-ui/dev/dist'
                    } else if (jobName.endsWith('_SIT')) {
                        env.DEPLOY_ENV = 'SIT'
                        env.EXPECTED_BRANCH = 'SIT'
                        env.SOURCE_BRANCH = 'DEV'
                        env.DEPLOY_DIR = '/var/www/product-ui/sit/dist'
                    } else if (jobName.endsWith('_UAT')) {
                        env.DEPLOY_ENV = 'UAT'
                        env.EXPECTED_BRANCH = 'UAT'
                        env.SOURCE_BRANCH = 'SIT'
                        env.DEPLOY_DIR = '/var/www/product-ui/uat/dist'
                    } else {
                        error(
                            "Unknown job name: ${env.JOB_NAME}. " +
                            "Expected suffix _DEV, _SIT, or _UAT."
                        )
                    }

                    echo "Jenkins Job      : ${env.JOB_NAME}"
                    echo "Deployment Env   : ${env.DEPLOY_ENV}"
                    echo "Expected Branch  : ${env.EXPECTED_BRANCH}"
                    echo "Publish Directory: ${env.DEPLOY_DIR}"
                    echo "Promotion Source : ${env.SOURCE_BRANCH ?: 'N/A'}"
                }
            }
        }

        // --------------------------------------------------
        // 2. Checkout only the configured job branch
        // --------------------------------------------------
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm

                script {
                    env.COMMIT_SHA = sh(
                        script: 'git rev-parse HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Checked-out commit: ${env.COMMIT_SHA}"

                    sh '''
                        set -eu

                        git fetch origin \
                          "+refs/heads/${EXPECTED_BRANCH}:refs/remotes/origin/${EXPECTED_BRANCH}"

                        ACTUAL_COMMIT="$(git rev-parse HEAD)"
                        BRANCH_COMMIT="$(git rev-parse "refs/remotes/origin/${EXPECTED_BRANCH}")"

                        echo "HEAD commit:   ${ACTUAL_COMMIT}"
                        echo "Branch commit: ${BRANCH_COMMIT}"

                        if [ "$ACTUAL_COMMIT" != "$BRANCH_COMMIT" ]; then
                            echo "ERROR: Checked-out commit does not match the configured environment branch."
                            exit 1
                        fi
                    '''
                }
            }
        }

        // --------------------------------------------------
        // 3. Validate UI source files
        // --------------------------------------------------
        stage('Validate Source') {
            steps {
                sh '''
                    set -eu

                    test -f package.json
                    test -f package-lock.json
                    test -f vite.config.js || test -f vite.config.ts

                    if [ ! -f src/main.jsx ] && [ ! -f src/main.tsx ]; then
                        echo "ERROR: src/main.jsx or src/main.tsx was not found."
                        exit 1
                    fi

                    echo "UI source files verified."
                '''
            }
        }

        // --------------------------------------------------
        // 4. Validate DEV -> SIT -> UAT promotion
        // --------------------------------------------------
        stage('Validate Promotion') {
            steps {
                script {
                    if (env.DEPLOY_ENV == 'DEV') {
                        env.SHOULD_DEPLOY = 'true'
                        echo 'DEV deployment is allowed.'
                    } else {
                        def validationResult = sh(
                            script: '''
                                set -eu

                                echo "Checking promotion into ${EXPECTED_BRANCH}"
                                echo "Required source branch: ${SOURCE_BRANCH}"

                                git fetch origin \
                                  "+refs/heads/${SOURCE_BRANCH}:refs/remotes/origin/${SOURCE_BRANCH}"

                                PARENT_LINE="$(git rev-list --parents -n 1 HEAD)"
                                PARENT_COUNT="$(echo "$PARENT_LINE" | awk '{print NF - 1}')"

                                echo "Merge parent count: ${PARENT_COUNT}"

                                if [ "$PARENT_COUNT" -lt 2 ]; then
                                    echo "SKIP: Current commit is not a merge commit."
                                    exit 10
                                fi

                                SOURCE_PARENT="$(git rev-parse HEAD^2)"

                                echo "Merged source commit: ${SOURCE_PARENT}"

                                if git merge-base --is-ancestor \
                                    "$SOURCE_PARENT" \
                                    "refs/remotes/origin/${SOURCE_BRANCH}"; then
                                    echo "Promotion validation passed."
                                    exit 0
                                else
                                    echo "SKIP: The second merge parent is not in ${SOURCE_BRANCH} history."
                                    exit 10
                                fi
                            ''',
                            returnStatus: true
                        )

                        if (validationResult == 0) {
                            env.SHOULD_DEPLOY = 'true'
                        } else if (validationResult == 10) {
                            env.SHOULD_DEPLOY = 'false'
                        } else {
                            error(
                                "Promotion validation failed due to a Git error. " +
                                "Deployment is blocked."
                            )
                        }
                    }

                    echo "Should deploy: ${env.SHOULD_DEPLOY}"
                }
            }
        }

        // --------------------------------------------------
        // 5. Build and publish UI
        // --------------------------------------------------
        stage('Build and Deploy UI') {
            when {
                expression {
                    return env.SHOULD_DEPLOY == 'true'
                }
            }

            steps {
                sh '''
                    set -eu

                    echo "Deploying ${DEPLOY_ENV}"
                    echo "Branch: ${EXPECTED_BRANCH}"
                    echo "Commit: ${COMMIT_SHA}"

                    test -x /usr/local/sbin/deploy-product-ui

                    sudo -n /usr/local/sbin/deploy-product-ui \
                      "${DEPLOY_ENV}" \
                      "${WORKSPACE}"
                '''
            }
        }

        // --------------------------------------------------
        // 6. Verify published frontend files
        // --------------------------------------------------
        stage('Verify Published Output') {
            when {
                expression {
                    return env.SHOULD_DEPLOY == 'true'
                }
            }

            steps {
                sh '''
                    set -eu

                    echo "Checking published UI: ${DEPLOY_DIR}/index.html"

                    test -s "${DEPLOY_DIR}/index.html"

                    echo "Published index.html exists."
                '''
            }
        }

        // --------------------------------------------------
        // 7. Explain skipped deployments
        // --------------------------------------------------
        stage('Deployment Skipped') {
            when {
                expression {
                    return env.SHOULD_DEPLOY != 'true'
                }
            }

            steps {
                echo """
                UI deployment skipped.

                Environment : ${env.DEPLOY_ENV}
                Branch      : ${env.EXPECTED_BRANCH}
                Commit      : ${env.COMMIT_SHA}

                The required promotion merge was not detected.
                No deployment command was executed.
                """
            }
        }
    }

    post {
        success {
            echo "UI pipeline completed successfully for ${env.DEPLOY_ENV}."
        }

        failure {
            echo "UI pipeline failed for ${env.DEPLOY_ENV}. Review the console output."
        }

        always {
            echo "Job: ${env.JOB_NAME}"
            echo "Build: #${env.BUILD_NUMBER}"
        }
    }
}
