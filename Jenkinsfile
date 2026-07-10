pipeline {
  agent any

  environment {
    CI = 'true'
    NODE_ENV = 'test'
    ENV = credentials('jenkins-env')
    ROLE = credentials('jenkins-role')
    BROWSER = credentials('jenkins-browser')
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

    stage('Install dependencies') {
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

    stage('Install Playwright browser') {
      steps {
        script {
          if (isUnix()) {
            sh 'npx playwright install chromium'
          } else {
            bat 'npx playwright install chromium'
          }
        }
      }
    }

    stage('Typecheck') {
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

    stage('Run UI tests') {
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

    stage('Generate reports') {
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
      archiveArtifacts artifacts: 'osttra-framework/reports/**', allowEmptyArchive: true
      junit allowEmptyResults: true, testResults: 'osttra-framework/reports/junit-*.xml'
    }

    failure {
      echo 'Pipeline failed. Check the console output and reports.'
    }
  }
}
