```groovy
pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 5, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  tools {
    nodejs 'node-22'
  }

  stages {
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
        sh 'npm run test'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Artifact') {
      steps {
        sh 'test -d dist'
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }

    stage('Deploy na Vercel') {
      when {
        branch 'main'
      }
      steps {
        withCredentials([string(credentialsId: 'VERCEL_DEPLOY_HOOK_URL', variable: 'VERCEL_DEPLOY_HOOK_URL')]) {
          sh 'curl -fsS -X POST "$VERCEL_DEPLOY_HOOK_URL"'
        }
      }
    }
  }

  post {
    success {
      script {
        if (env.BRANCH_NAME == 'main') {
          echo 'Deploy disparado e estará disponível na Vercel em breve.'
          currentBuild.description = 'Vercel deploy iniciado'
        } else {
          echo 'Build e validação concluídos com sucesso.'
        }
      }
    }

    failure {
      echo 'Falha no pipeline.'
      script {
        currentBuild.description = 'Falha no pipeline'
      }
    }

    always {
      cleanWs()
    }
  }
}
```
