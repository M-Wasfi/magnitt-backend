pipeline {
        agent {
        docker {
            image 'node:lts-bullseye-slim' 
            args '-p 3000:3000' 
        }
    }
    parameters {
        choice(name: 'VERSION', choices: ['1.1.0', '1.2.0', '1.3.0'], description: '')
        booleanParam(name: 'executeTests', defaultValue: true, description: '')
    }
    stages {
        stage("init") {
            steps {
                echo '=====Init====='
            }
        }
        stage("build") {
            steps {
                echo '=====Building app====='
                sh 'npm install' 
                sh 'npm run build' 
            }
        }
        stage("test") {
            when {
                expression {
                    params.executeTests
                }
            }
            steps {
                echo '=====Testing app====='
            }
        }
        stage("deploy") {
            steps {
                echo '=====Deploying app====='
            }
        }
    }   
}
