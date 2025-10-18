from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Seed demo data: places and menu items'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')
        # Implement seeding logic here
        self.stdout.write(self.style.SUCCESS('Done.'))
