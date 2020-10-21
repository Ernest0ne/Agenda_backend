module.exports = {
    apps: [
        {
            name: 'Polaris',
            script: './index.js',
            watch: true,
            ignore_watch: ['node_modules', 'logs'],
            env: {
                'PORT': 3000,
                'NODE_ENV': 'production',
                'IP_HOST': 'selfservice.wposs.com',
                'HOST_DATABASE': '172.24.16.42',
                'HOST_FRONTEND': 'selfservice.wposs.com',
                'PORT_DATABASE': '9042',
                'TIME_ZONE': 'America/Bogota',
                'DATE_FORMAT': 'DD-MM-YYYY HH:mm:ss',
                'DATE_FORMAT_BD': 'YYYY-MM-DD HH:mm:ss',
                'DATE_FORMAT_VALIDATE': 'DD-MM-YYYY',
            },
            node_args: '--max_old_space_size=6144',
            max_memory_restart: '6000M'
        }
    ]
}