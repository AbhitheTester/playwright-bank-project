pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['sit', 'uat'],
            description: 'Select Environment'
        )
    }

    environment {
        CI = 'true'
        NODE_ENV = 'test'
    }

    options {
        timestamps()
        skipDefaultCheckout(false)
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Environment') {
            steps {
                script {

                    def envCredential = params.ENVIRONMENT == 'sit' ? 'env-sit' : 'env-uat'

                    withCredentials([file(credentialsId: envCredential, variable: 'ENV_FILE')]) {

                        if (isUnix()) {
                            sh 'cp "$ENV_FILE" .env'
                        } else {
                            bat 'copy "%ENV_FILE%" .env'
                        }

                    }

                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm ci --no-audit --no-fund'
                    } else {
                        bat 'npm ci --no-audit --no-fund'
                    }
                }
            }
        }

        stage('Install Playwright Browser') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npx playwright install'
                    } else {
                        bat 'npx playwright install'
                    }
                }
            }
        }

        stage('Type Check') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run typecheck'
                    } else {
                        bat 'npm run typecheck'
                    }
                }
            }
        }

        stage('Run UI Tests') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run test:ui'
                    } else {
                        bat 'npm run test:ui'
                    }
                }
            }
        }

        stage('Generate Report') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run report:generate'
                    } else {
                        bat 'npm run report:generate'
                    }
                }
            }
        }
    }

    post {

        always {

            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true

            junit allowEmptyResults: true,
                  testResults: 'reports/**/*.xml'

        }

        success {
            echo 'Build completed successfully.'
        }

        failure {
            echo 'Build failed.'
        }

        cleanup {
            cleanWs()
        }
    }
}