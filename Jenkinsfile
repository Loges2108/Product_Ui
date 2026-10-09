pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    parameters {
        choice(
            name: 'TARGET_ENV',
            choices: ['DEV', 'SIT', 'UAT'],
            description: 'Select the environment to deploy'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                git branch: "${params.TARGET_ENV}",
                    url: 'https://github.com/Loges2108/Product_Ui.git'
            }
        }

        stage('Deploy UI') {
            steps {
                sh '''
                    sudo -n /usr/local/sbin/deploy-product-ui \
                      "$TARGET_ENV" "$WORKSPACE"
                '''
            }
        }

        stage('Verify Build') {
            steps {
                script {
                    def hosts = [
                        DEV: 'prod-dev-ui.work.gd',
                        SIT: 'prod-sit-ui.work.gd',
                        UAT: 'prod-uat-ui.work.gd'
                    ]
                    env.UI_HOST = hosts[params.TARGET_ENV]
                }

                sh '''
                    curl --fail --silent --show-error \
                      --retry 5 --retry-delay 3 \
                      -H "Host: ${UI_HOST}" \
                      http://127.0.0.1/ > /dev/null

                    echo "UI deployment verified"
                '''
            }
        }
    }
}
