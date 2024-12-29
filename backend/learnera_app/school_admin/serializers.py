import json
from rest_framework import serializers
from django.contrib.auth import authenticate
from parents.models import Parent
from teachers.models import SchoolClass, Section, Teacher
from students.models import Student
from users.models import CustomUser


class SchoolAdminLoginSerializers(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=100, write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username:
            raise serializers.ValidationError("Username is required")
        elif not password:
            raise serializers.ValidationError("Password is required")

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_schooladmin:
            raise serializers.ValidationError("You do not have access as School admin")

        return {"user": user, "username": username, "password": password}


class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    emergency_contact_number = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )
    profile_image = serializers.ImageField(required=False)
    is_student = serializers.BooleanField(required=False)
    is_parent = serializers.BooleanField(required=False)
    is_teacher = serializers.BooleanField(required=False)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "password",
            "profile_image",
            "first_name",
            "last_name",
            "phone_number",
            "emergency_contact_number",
            "date_of_birth",
            "gender",
            "address",
            "city",
            "state",
            "district",
            "country",
            "is_student",
            "is_parent",
            "is_teacher",
            "is_active",
        ]

    def create(self, validated_data):
        print("validated data is here", validated_data)
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()

        return user


class SchoolAdminStudentSerializers(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class_assigned = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all())

    class Meta:
        model = Student
        fields = [
            "user",
            "parent_name",
            "admission_number",
            "parent_email",
            "class_assigned",
        ]

    def create(self, validated_data):
        # Extract user data
        user_data = validated_data.pop("user", {})

        # Create user first
        user_serializer = CustomUserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # Create student with the user
        student = Student.objects.create(user=user, **validated_data)

        return student

    def to_internal_value(self, data):
        # Handle JSON string for user
        if isinstance(data.get("user"), str):
            try:
                data["user"] = json.loads(data["user"])
            except json.JSONDecodeError:
                raise serializers.ValidationError({"user": "Invalid JSON data"})

        return super().to_internal_value(data)


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["id", "section_name", "student_count"]


class SchoolClassSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    class_teacher = serializers.CharField(required=False)

    class Meta:
        model = SchoolClass
        fields = ["id", "class_name", "class_teacher", "sections"]


class StudentListSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class_assigned = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "user",
            "parent_name",
            "admission_number",
            "parent_email",
            "class_assigned",
        ]

    def get_class_assigned(self, obj):
        # This method will return a dictionary with class and section details
        return {
            "id": obj.class_assigned.id,
            "class_name": obj.class_assigned.school_class.class_name,
            "section_name": obj.class_assigned.section_name,
        }


class StudentDetailSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class_assigned = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "user",
            "admission_number",
            "parent_name",
            "parent_email",
            "class_assigned",
        ]

    def get_class_assigned(self, obj):
        return {
            "id": obj.class_assigned.id,
            "class_name": obj.class_assigned.school_class.class_name,
            "section_name": obj.class_assigned.section_name,
        }


class AdminParentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    students = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Parent
        fields = ["id", "user", "occupation", "students"]

    def create(self, validated_data):
        user_data = validated_data.pop("user", {})
        user_serializer = CustomUserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()


# -----------------------------------------------------------------------------


class SchoolClassCreateSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(write_only=True)
    student_count = serializers.IntegerField(required=False, write_only=True)

    class Meta:
        model = SchoolClass
        fields = ["id", "class_name", "class_teacher", "section_name", "student_count"]

    def create(self, validated_data):
        section_name = validated_data.pop("section_name", None)
        student_count = validated_data.pop("student_count", 30)

        school_class, _ = SchoolClass.objects.get_or_create(
            class_name=validated_data.get("class_name"), defaults=validated_data
        )

        if Section.objects.filter(
            school_class=school_class, section_name=section_name
        ).exists():
            raise serializers.ValidationError(
                {
                    "section": f"Section {section_name} already exists for class {school_class.class_name}."
                }
            )

        Section.objects.create(
            school_class=school_class,
            section_name=section_name,
            student_count=student_count,
        )

        return school_class


class ClassListSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    class_teacher_info = serializers.SerializerMethodField()

    class Meta:
        model = SchoolClass
        fields = ["id", "class_name", "sections", "class_teacher_info"]

    def get_class_teacher_info(self, obj):
        if obj.class_teacher:
            return {
                "id": obj.class_teacher.id,
                "name": f"{obj.class_teacher.user.first_name} {obj.class_teacher.user.last_name}",
                "profile_image": (
                    obj.class_teacher.user.profile_image.url
                    if obj.class_teacher.user.profile_image
                    else None
                ),
            }
        return None


class SchoolClassUpdateSerializer(serializers.ModelSerializer):
    section = SectionSerializer()

    class Meta:
        model = SchoolClass
        fields = ["id", "class_name", "class_teacher", "section"]

    def update(self, instance, validated_data):
        section_data = validated_data.pop("section", None)

        # Update class fields
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()

        # Update section if provided
        if section_data and self.context.get("section_instance"):
            section = self.context["section_instance"]
            for key, value in section_data.items():
                setattr(section, key, value)
            section.save()

        return instance


# PARENT MANAGEMENT
# ---------------------------------------------------------------------------


class StudentUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "profile_image",
            "full_name",
        ]

    def get_profile_image(self, obj):
        request = self.context.get("request")
        if obj.profile_image and hasattr(obj.profile_image, "url"):
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class ParentStudentSerializer(serializers.ModelSerializer):
    user = StudentUserSerializer(read_only=True)
    class_name = serializers.CharField(
        source="class_assigned.class_name", read_only=True
    )
    admission_number = serializers.CharField(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "admission_number", "user", "class_name"]


class ParentUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False)  # Changed from SerializerMethodField
    password = serializers.CharField(write_only = True, required = False)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "password",
            "profile_image",
            "first_name",
            "last_name",
            "phone_number",
            "emergency_contact_number",
            "date_of_birth",
            "gender",
            "address",
            "city",
            "state",
            "district",
            "country",
            "is_active"
        ]

    def get_profile_image(self, obj):
        request = self.context.get("request")
        if obj.profile_image and hasattr(obj.profile_image, "url"):
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None
    
    def update(self, instance, validated_data):
        validated_data.pop('password', None)
        return super().update(instance, validated_data)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")
        
        if instance.profile_image and hasattr(instance.profile_image, "url"):
            if request:
                representation['profile_image'] = request.build_absolute_uri(instance.profile_image.url)
            else:
                representation['profile_image'] = instance.profile_image.url
        return representation


class ParentSerializer(serializers.ModelSerializer):
    user = ParentUserSerializer()
    students = ParentStudentSerializer(many=True, read_only=True)
    student_admission_numbers = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )
    total_students = serializers.SerializerMethodField()

    class Meta:
        model = Parent
        fields = [
            "id",
            "user",
            "occupation",
            "students",
            "student_admission_numbers",
            "total_students",
        ]

    def get_total_students(self, obj):
        return obj.students.count()

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user_data["is_parent"] = True

        user_seralizer = CustomUserSerializer(data=user_data)
        user_seralizer.is_valid(raise_exception=True)
        user = user_seralizer.save()
        student_admission_numbers = validated_data.pop("student_admission_numbers", [])

        parent = Parent.objects.create(
            user=user, occupation=validated_data.get("occupation", "")
        )

        self.link_students(parent, student_admission_numbers)
        return parent

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        print(f"This is the user data afer removing password")
        student_admission_numbers = validated_data.pop(
            "student_admission_numbers", None
        )
        
        

        user_serializer = ParentUserSerializer(
            instance.user,
            data=user_data,
            partial=True  
        )
        if user_serializer.is_valid(raise_exception=True):
            user_serializer.save()

        if "occupation" in validated_data:
            instance.occupation = validated_data["occupation"]
            instance.save()

        if student_admission_numbers is not None:
            self.link_students(instance, student_admission_numbers)

        return instance

    def link_students(self, parent, admission_numbers):
        if not admission_numbers:
            return

        valid_students = Student.objects.filter(admission_number__in=admission_numbers)
        found_numbers = {str(student.admission_number) for student in valid_students}
        invalid_numbers = set(admission_numbers) - found_numbers

        if invalid_numbers:
            raise serializers.ValidationError(
                {
                    "student_admission_numbers": f"Invalid admission numbers: {', '.join(invalid_numbers)}"
                }
            )

        parent.students.set(valid_students)
