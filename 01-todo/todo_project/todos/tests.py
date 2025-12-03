from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from .models import Todo


class TodoModelTestCase(TestCase):
    def setUp(self):
        self.todo = Todo.objects.create(
            title="Test Todo",
            description="Test Description",
            due_date=timezone.now() + timedelta(days=7)
        )

    def test_todo_creation(self):
        self.assertEqual(self.todo.title, "Test Todo")
        self.assertEqual(self.todo.description, "Test Description")
        self.assertFalse(self.todo.is_resolved)
        self.assertIsNotNone(self.todo.created_at)
        self.assertIsNotNone(self.todo.updated_at)

    def test_todo_str_method(self):
        self.assertEqual(str(self.todo), "Test Todo")

    def test_todo_default_values(self):
        todo = Todo.objects.create(title="Simple Todo")
        self.assertEqual(todo.description, "")
        self.assertIsNone(todo.due_date)
        self.assertFalse(todo.is_resolved)

    def test_todo_ordering(self):
        todo1 = Todo.objects.create(title="First Todo")
        todo2 = Todo.objects.create(title="Second Todo")
        todos = Todo.objects.all()
        self.assertEqual(todos[0], todo2)
        self.assertEqual(todos[1], todo1)


class TodoViewsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.todo1 = Todo.objects.create(
            title="Todo 1",
            description="Description 1",
            due_date=timezone.now() + timedelta(days=5)
        )
        self.todo2 = Todo.objects.create(
            title="Todo 2",
            description="Description 2",
            is_resolved=True
        )

    def test_todo_list_view(self):
        response = self.client.get(reverse('todo_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_list.html')
        self.assertContains(response, "Todo 1")
        self.assertContains(response, "Todo 2")
        self.assertEqual(len(response.context['todos']), 2)

    def test_todo_create_view_get(self):
        response = self.client.get(reverse('todo_create'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_form.html')

    def test_todo_create_view_post(self):
        data = {
            'title': 'New Todo',
            'description': 'New Description',
            'due_date': (timezone.now() + timedelta(days=10)).strftime('%Y-%m-%d %H:%M:%S')
        }
        response = self.client.post(reverse('todo_create'), data)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Todo.objects.filter(title='New Todo').exists())
        new_todo = Todo.objects.get(title='New Todo')
        self.assertEqual(new_todo.description, 'New Description')
        self.assertFalse(new_todo.is_resolved)

    def test_todo_create_view_post_minimal(self):
        data = {'title': 'Minimal Todo'}
        response = self.client.post(reverse('todo_create'), data)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Todo.objects.filter(title='Minimal Todo').exists())

    def test_todo_update_view_get(self):
        response = self.client.get(reverse('todo_update', args=[self.todo1.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_form.html')
        self.assertContains(response, 'Todo 1')

    def test_todo_update_view_post(self):
        data = {
            'title': 'Updated Todo',
            'description': 'Updated Description',
            'due_date': (timezone.now() + timedelta(days=3)).strftime('%Y-%m-%d %H:%M:%S'),
            'is_resolved': True
        }
        response = self.client.post(reverse('todo_update', args=[self.todo1.pk]), data)
        self.assertEqual(response.status_code, 302)
        self.todo1.refresh_from_db()
        self.assertEqual(self.todo1.title, 'Updated Todo')
        self.assertEqual(self.todo1.description, 'Updated Description')
        self.assertTrue(self.todo1.is_resolved)

    def test_todo_delete_view_get(self):
        response = self.client.get(reverse('todo_delete', args=[self.todo1.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_confirm_delete.html')
        self.assertContains(response, 'Todo 1')

    def test_todo_delete_view_post(self):
        todo_id = self.todo1.pk
        response = self.client.post(reverse('todo_delete', args=[todo_id]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Todo.objects.filter(pk=todo_id).exists())

    def test_toggle_resolved_view(self):
        self.assertFalse(self.todo1.is_resolved)
        response = self.client.get(reverse('todo_toggle', args=[self.todo1.pk]))
        self.assertEqual(response.status_code, 302)
        self.todo1.refresh_from_db()
        self.assertTrue(self.todo1.is_resolved)

        response = self.client.get(reverse('todo_toggle', args=[self.todo1.pk]))
        self.todo1.refresh_from_db()
        self.assertFalse(self.todo1.is_resolved)

    def test_toggle_resolved_already_resolved(self):
        self.assertTrue(self.todo2.is_resolved)
        response = self.client.get(reverse('todo_toggle', args=[self.todo2.pk]))
        self.assertEqual(response.status_code, 302)
        self.todo2.refresh_from_db()
        self.assertFalse(self.todo2.is_resolved)


class TodoIntegrationTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_full_todo_lifecycle(self):
        response = self.client.post(reverse('todo_create'), {
            'title': 'Lifecycle Todo',
            'description': 'Testing full lifecycle'
        })
        self.assertEqual(response.status_code, 302)

        todo = Todo.objects.get(title='Lifecycle Todo')
        self.assertFalse(todo.is_resolved)

        response = self.client.post(reverse('todo_update', args=[todo.pk]), {
            'title': 'Updated Lifecycle Todo',
            'description': 'Updated description',
            'is_resolved': False
        })
        todo.refresh_from_db()
        self.assertEqual(todo.title, 'Updated Lifecycle Todo')

        response = self.client.get(reverse('todo_toggle', args=[todo.pk]))
        todo.refresh_from_db()
        self.assertTrue(todo.is_resolved)

        response = self.client.post(reverse('todo_delete', args=[todo.pk]))
        self.assertFalse(Todo.objects.filter(pk=todo.pk).exists())

    def test_list_view_shows_correct_status(self):
        Todo.objects.create(title="Pending Todo", is_resolved=False)
        Todo.objects.create(title="Resolved Todo", is_resolved=True)

        response = self.client.get(reverse('todo_list'))
        self.assertContains(response, "Pending")
        self.assertContains(response, "Resolved")
