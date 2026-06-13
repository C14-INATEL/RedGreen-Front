pipeline {
  agent any

  tools {
    nodejs 'node-22'
  }

  environment {
    VERCEL_DEPLOY_HOOK_URL = credentials('VERCEL_DEPLOY_HOOK_URL')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Instalar dependências') {
      steps {
        sh 'npm install --legacy-peer-deps'
      }
    }

    stage('Lint e Format') {
      steps {
        sh 'npm run lint'
        sh 'npm run format'
      }
    } 

    stage('Testes') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Deploy na Vercel') {
      steps {
        sh 'curl -X POST $VERCEL_DEPLOY_HOOK_URL'
      }
    }
  }

  post {
    success {
      echo 'Deploy realizado com sucesso!'
    }
    failure {
      echo 'Falha no pipeline.'
    }
    always {
      cleanWs()
    }
  }

}
